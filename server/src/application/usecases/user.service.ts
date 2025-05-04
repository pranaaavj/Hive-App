// src/app/usecases/user.service.ts
import jwt from 'jsonwebtoken';
import { IRegisterUserDTO, ILoginUserDTO, IUserDTO } from '../../domain/entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../../utils/hash';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../utils/jwt';
import { sendVerificationEmail } from '../../utils/sendEmail';

const userRepository = new UserRepository();

export class UserService {
  async register(userData: IRegisterUserDTO) {
    const existingUser = await userRepository.findUserByEmail(userData.email);

    if (existingUser?.isVerified == false) {
      const token = jwt.sign({ userId: existingUser._id }, process.env.EMAIL_SECRET!, {
        expiresIn: '2m',
      });
      await sendVerificationEmail(existingUser.email, token, "register" );

      return existingUser;
    }

    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await hashPassword(userData.password);

    const newUser = await userRepository.createUser({
      ...userData,
      password: hashedPassword,
    });
    const token = jwt.sign({ userId: newUser._id }, process.env.EMAIL_SECRET!, { expiresIn: '2m' });
    await sendVerificationEmail(newUser.email, token, "register");

    return {
      id: newUser.id,
      name: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  }

  async login(credentials: ILoginUserDTO) {
    const user = await userRepository.findUserByEmail(credentials.email);
    if (!user) throw new Error('Invalid email or password');
    console.log(user);

    if(!user.isVerified) {
       throw new Error("User Email not verified, Retry using register")
    }

    // Compare password
    const isPasswordValid = await comparePassword(credentials.password, user.password);
    if (!isPasswordValid) throw new Error('Invalid email or password');

    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return { accessToken, refreshToken, user };
  }

  async refreshToken(refreshToken: string): Promise<string> {
    const payload = verifyRefreshToken(refreshToken);

    if (!payload || !payload.id || !payload.email) {
      throw new Error('Invalid refresh token');
    }

    // Generate new access token using id and email
    const newAccessToken = generateAccessToken({ id: payload.id, email: payload.email } as any);
    return newAccessToken;
  }

  async verifyEmail(token: string): Promise<string> {
    const { userId } = jwt.verify(token, process.env.EMAIL_SECRET!) as { userId: string };
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    user.isVerified = true;
    await user.save();

    return `${process.env.CLIENT_URL}/login?verified=true`;
  }
async passwordResetEmail(email: string) : Promise<void> {
  const user = await userRepository.findUserByEmail(email)
  if(!user) throw new Error("Email not found")

    const token = jwt.sign({ userId: user._id }, process.env.EMAIL_SECRET!, { expiresIn: '2m' });

    user.resetPasswordToken = token
    await user.save()

    await sendVerificationEmail(user.email, token, "forgot")

}
async forgotVerifyEmail(token: string): Promise<string> {
  try {
    const { userId } = jwt.verify(token, process.env.EMAIL_SECRET!) as { userId: string };
    
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    if (user.resetPasswordToken !== token) {
      throw new Error('Invalid reset token');
    }

    return `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Reset link expired. Please request a new one.');
    }
    throw new Error('Invalid reset link.');
  }
}
async resetPassword(token: string, newPassword: string): Promise<void> {
  try {
    // Will throw if token is invalid or expired
    jwt.verify(token, process.env.EMAIL_SECRET!);

    const user = await userRepository.findUserByResetToken(token);
    if (!user) throw new Error("User not found");

    user.password = await hashPassword(newPassword);
    await user.save();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Reset link has expired. Please request a new one.");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token.");
    } else {
      throw error; 
    }
  }
}

}
