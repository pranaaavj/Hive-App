// src/app/usecases/user.service.ts
import jwt from "jsonwebtoken"
import { IRegisterUserDTO, ILoginUserDTO, IUserDTO } from '../../domain/entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../../utils/hash';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../utils/jwt';
import { sendEmail } from '../../utils/sendEmail';


const userRepository = new UserRepository();

export class UserService {
  async register(userData: IRegisterUserDTO) {
    const existingUser = await userRepository.findUserByEmail(userData.email);
    if (existingUser) throw new Error('User already exists');

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const newUser = await userRepository.createUser({
      ...userData,
      password: hashedPassword,
    });
    const token = jwt.sign({ userId: newUser._id }, process.env.EMAIL_SECRET!, { expiresIn: "1h" });
    await sendEmail({email: newUser.email, token})


    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  }

  async login(credentials: ILoginUserDTO) {
    const user = await userRepository.findUserByEmail(credentials.email);
    if (!user) throw new Error('Invalid email or password');

    // Compare password
    const isPasswordValid = await comparePassword(credentials.password, user.password);
    if (!isPasswordValid) throw new Error('Invalid email or password');

    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const payload = verifyRefreshToken(refreshToken);

    if (!payload || !payload.id || !payload.email) {
      throw new Error('Invalid refresh token');
    }

    // Generate new access token using id and email
    const newAccessToken = generateAccessToken({ id: payload.id, email: payload.email } as any);
    return newAccessToken;
  }

  async verifyEmail(token: string): Promise<string>  {

    const {userId} = jwt.verify(token, process.env.EMAIL_SECRET!) as {userId: string}
    const user = await userRepository.findUserById(userId)
    if (!user) throw new Error('User not found');
    
    user.isVerified = true
    await user.save()

    return `${process.env.CLIENT_URL}/login?verified=true`
  }
}
