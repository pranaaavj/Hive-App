import { IRegisterUserDTO, ILoginUserDTO } from '../../domain/entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { sendEmail } from '../../utils/sendEmail';
import crypto from 'crypto';
import { log } from 'console';

const userRepository = new UserRepository();

export class UserService {
  async register(userData: IRegisterUserDTO) {
    // Check if a user already exists
    const existingUser = await userRepository.findTempUserByEmail(userData.email);
    if (existingUser) throw new Error('User already exists');

    // Hash password before storing
    const hashedPassword = await hashPassword(userData.password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('verification token from the register' , verificationToken)
    // Create temporary user in TempUser collection
    const tempUser = await userRepository.createTempUser({
      ...userData,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires: tokenExpiry
    });

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    // Send verification email
    await sendEmail({
      email: tempUser.email,
      token: verificationToken,
      verificationUrl: verificationUrl,  // Added verificationUrl
    });
    return { message: 'Verification email sent successfully' };
  }

  async login(credentials: ILoginUserDTO) {
    const user = await userRepository.findUserByEmail(credentials.email);
    if (!user) throw new Error('Invalid email or password');

    if (!user.isVerified) {
      throw new Error('Please verify your email before logging in');
    }

    const isPasswordValid = await comparePassword(credentials.password, user.password);
    if (!isPasswordValid) throw new Error('Invalid email or password');

    const userId = user._id as string;
    const accessToken = generateAccessToken({
      id: userId,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: userId,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const payload = verifyRefreshToken(refreshToken);

    if (!payload || typeof payload !== 'object' || !payload.id || !payload.email) {
      throw new Error('Invalid refresh token');
    }

    return generateAccessToken({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });
  }

  async verifyEmail(token: string) {
    const tempUser = await userRepository.findTempUserByVerificationToken(token);
    if (!tempUser) throw new Error('Invalid or expired token');

    // Check token expiry
    if (tempUser.verificationTokenExpires < new Date()) {
      throw new Error('Verification token has expired');
    }

    // Migrate the user from TempUser to User collection
    const user = await userRepository.createUser({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      isVerified: true
    });

    // Delete the temporary user
    await userRepository.deleteTempUserByEmail(user.email);

    return {
      id: user.id,
      email: user.email,
      isVerified: user.isVerified,
    };
  }

  async resendVerificationEmail(email: string) {
    const tempUser = await userRepository.findTempUserByEmail(email);
    if (!tempUser) throw new Error('User not found');

    // Generate a new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    console.log('verification token for reseting from the user service:',verificationToken)
    tempUser.verificationToken = verificationToken;
    tempUser.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await tempUser.save();


    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    // Send the email again
    await sendEmail({
      email: tempUser.email,
      token: verificationToken,
      verificationUrl: verificationUrl,  // Added verificationUrl
    });
    return { message: 'Verification email resent successfully' };
  }


  async forgotPassword(email: string) {
    const user = await userRepository.findUserByEmail(email);
    if (!user || !user.isVerified) throw new Error('User not found or not verified');

    const resetToken = crypto.randomBytes(32).toString('hex');

    console.log(resetToken,'reset token from the forget-pass')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log(hashedToken,'hassed token from the forgot password')
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      token: resetToken,
      verificationUrl: resetUrl,
      type: 'reset'
    });

    return { message: 'Password reset link sent to your email' };
  }

  async resetPassword(token: string, newPassword: string) {

    console.log(token,'token from the reset password')
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log(hashedToken,'hashed token from the reset - pass')
    const user = await userRepository.findUserByResetToken(hashedToken);
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new Error('Token is invalid or expired');
    }

    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successful' };
  }

}
