
import jwt from 'jsonwebtoken';
import { IUser,User } from '../../domain/entities/user.entity'; 
import { UserRepository } from '../repositories/user.repository'; 
import { RedisClient } from '../../infrastructure/cache/redis';
import { ApiError } from '../../utils/apiError';
import { IUserModel } from '../../infrastructure/model/user.model'; 
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt';
import { sendVerificationEmail } from '../../utils/sendEmail';

export class UserService {
  private redis: RedisClient;

  constructor(private userRepository: UserRepository) {
    this.redis = new RedisClient();
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<IUserModel> {
    try {
      let existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        if (!existingUser.isVerified) {
          const token = jwt.sign({ userId: existingUser._id }, process.env.EMAIL_SECRET!, {
            expiresIn: '2m',
          });
          await sendVerificationEmail(existingUser.email, token, 'register');
          return existingUser;
        }
        throw new ApiError('Validation error', 409, { email: 'Email already in use' });
      }

      const existingUsername = await this.userRepository.findByUsername(userData.username);
      if (existingUsername) {
        throw new ApiError('Validation error', 409, { username: 'Username already taken' });
      }

      const userEntity = User.create({
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });

      const newUser = await this.userRepository.createUser(userEntity);
      const token = jwt.sign({ userId: newUser._id }, process.env.EMAIL_SECRET!, {
        expiresIn: '2m',
      });
      await sendVerificationEmail(newUser.email, token, 'register');

      return newUser;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error registering user', 500);
    }
  }

  async login(credentials: { identifier: string; password: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: IUserModel;
  }> {
    try {
      const user = await this.userRepository.findByEmailOrUsername(credentials.identifier);
      if (!user) {
        throw new ApiError('Username or email does not exist', 404);
      }

      if (!user.isVerified) {
        throw new ApiError('User email not verified, please register again', 403);
      }

      const isPasswordValid = await user.comparePassword(credentials.password);
      if (!isPasswordValid) {
        throw new ApiError('Invalid email or password', 401);
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      return { accessToken, refreshToken, user };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error logging in', 500);
    }
  }

  async logout(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
        id: string;
        exp: number;
      };
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiresIn > 0) {
        await this.redis.setEx(`blacklist:${token}`, 'true', expiresIn);
      }
    } catch (error) {
      throw new ApiError('Error logging out', 500);
    }
  }

  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const isBlacklisted = await this.redis.get(`blacklist:${refreshToken}`);
      if (isBlacklisted) {
        throw new ApiError('Invalid refresh token', 401);
      }

      const payload = verifyRefreshToken(refreshToken);
      if (!payload || !payload.id || !payload.email) {
        throw new ApiError('Invalid refresh token', 401);
      }

      const user = await this.userRepository.findById(payload.id);
      if (!user || user.isDeleted) {
        throw new ApiError('User not found', 404);
      }

      const newAccessToken = generateAccessToken(user);
      return newAccessToken;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error refreshing token', 401);
    }
  }

  async verifyEmail(token: string): Promise<string> {
    try {
      const { userId } = jwt.verify(token, process.env.EMAIL_SECRET!) as { userId: string };
      const user = await this.userRepository.findById(userId);
      if (!user || user.isDeleted) {
        throw new ApiError('User not found', 404);
      }

      await this.userRepository.update(userId, { isVerified: true });
      return `${process.env.CLIENT_URL}/login?verified=true`;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError('Verification link expired', 400);
      }
      throw new ApiError('Invalid or expired token', 400);
    }
  }

  async passwordResetEmail(email: string): Promise<void> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user || user.isDeleted) {
        throw new ApiError('Email not found', 404);
      }

      const token = jwt.sign({ userId: user._id }, process.env.EMAIL_SECRET!, {
        expiresIn: '2m',
      });

      await this.userRepository.update(user._id as string, { resetPasswordToken: token });
      await sendVerificationEmail(user.email, token, 'forgot');
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to send reset email', 500);
    }
  }

  async forgotVerifyEmail(token: string): Promise<string> {
    try {
      const { userId } = jwt.verify(token, process.env.EMAIL_SECRET!) as { userId: string };
      const user = await this.userRepository.findByResetToken(token);
      if (!user || user.isDeleted) {
        throw new ApiError('User not found', 404);
      }

      return `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError('Reset link expired', 400);
      }
      throw new ApiError('Invalid reset link', 400);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      jwt.verify(token, process.env.EMAIL_SECRET!);
      const user = await this.userRepository.findByResetToken(token);
      if (!user || user.isDeleted) {
        throw new ApiError('User not found', 404);
      }

      await this.userRepository.update(user._id as string, {
        password: newPassword,
        resetPasswordToken: undefined,
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError('Reset link expired', 400);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError('Invalid token', 400);
      }
      throw new ApiError('Failed to reset password', 500);
    }
  }
}