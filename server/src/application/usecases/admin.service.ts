import { AdminRepository } from '../repositories/admin.repository';
import { IAdminModel } from '../../infrastructure/model/adminModel';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../../utils/sendEmail';
import { ApiError } from '../../utils/apiError';
import { Admin } from '../../domain/entities/admin.entity';
import {
  generateAdminAccessToken,
  generateAdminRefreshToken,
  verifyAdminRefreshToken,
} from '../../utils/jwt';
import { RedisClient } from '../../infrastructure/cache/redis';

export class AdminService {
  private redis: RedisClient;
  constructor(private adminRepository: AdminRepository) {
    this.redis = new RedisClient();
  }
  async register(adminData: {
    adminName: string;
    email: string;
    password: string;
  }): Promise<IAdminModel> {
    try {
      let exitsAdmin = await this.adminRepository.findByEmail(adminData.email);
      if (exitsAdmin) {
        if (!exitsAdmin.isVerified) {
          const token = jwt.sign({ adminId: exitsAdmin._id }, process.env.ADMIN_EMAIL_SECRET!, {
            expiresIn: '2m',
          });
          await sendVerificationEmail(exitsAdmin.email, token, 'register');
          return exitsAdmin;
        }
        throw new ApiError('Validation error', 409, { email: 'Email already in use' });
      }

      const existingAdminName = await this.adminRepository.findByAdminName(adminData.adminName);
      if (existingAdminName) {
        throw new ApiError('validation error ', 409, { adminname: 'Name already taken' });
      }

      const adminEntity = Admin.create({
        adminName: adminData.adminName,
        email: adminData.email,
        password: adminData.password,
      });

      console.log(adminEntity, 'adminEntity');
      const newAdmin = await this.adminRepository.createNewAdmin(adminEntity);
      const token = jwt.sign({ adminId: newAdmin._id }, process.env.ADMIN_EMAIL_SECRET!, {
        expiresIn: '2m',
      });
      console.log(token, 'token for the verification');
      await sendVerificationEmail(newAdmin.email, token, 'register');
      return newAdmin;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error registering user', 500);
    }
  }

  async login(credentials: { email: string; password: string }): Promise<{
    adminAccessToken: string;
    adminRefreshToken: string;
    admin: IAdminModel;
  }> {
    const admin = await this.adminRepository.findByEmail(credentials.email);
    if (!admin) throw new ApiError('email does not exists', 404);
    if (!admin.isVerified) throw new ApiError('Admin emial is not verified', 403);
    const isPasswordValid = await admin.comparePassword(credentials.password);
    if (!isPasswordValid) throw new ApiError('admin password does not match', 401);
    const adminAccessToken = generateAdminAccessToken(admin);
    const adminRefreshToken = generateAdminRefreshToken(admin);

    return { adminAccessToken, adminRefreshToken, admin };
  }

  async verifyEmail(token: string): Promise<string> {
    try {
      const { adminId } = jwt.verify(token, process.env.ADMIN_EMAIL_SECRET!) as { adminId: string };
      const admin = await this.adminRepository.findById(adminId);
      if (!admin) {
        throw new ApiError('admin not found', 404);
      }
      await this.adminRepository.update(adminId, { isVerified: true });
      return `${process.env.CLIENT_URL}/login?verified=true`;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError('Verification link expired', 400);
      }
      throw new ApiError('Invalid or expired token', 400);
    }
  }

  async refreshToken(refreshToken: string): Promise<string | undefined> {
    try {
      const payload = verifyAdminRefreshToken(refreshToken);
      if (!payload || !payload.id || !payload.email)
        throw new ApiError('Inavlid Refresh Token', 401);

      const admin = await this.adminRepository.findById(payload.id);

      if (!admin) throw new ApiError('Admin not found', 404);
      return generateAdminAccessToken(admin);
    } catch (error) {
      console.log(error);
    }
  }

  async passwordResetEmail(email: string): Promise<void> {
    try {
      const admin = await this.adminRepository.findByEmail(email);
      if (!admin) throw new ApiError('Email not found', 404);
      const token = jwt.sign({ adminId: admin._id }, process.env.ADMIN_EMAIL_SECRET!, {
        expiresIn: '2m',
      });
      console.log(token, 'token for forget pass');
      await this.adminRepository.update(admin._id as string, { resetPasswordToken: token });
      await sendVerificationEmail(admin.email, token, 'forgot');
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to send reset email', 500);
    }
  }

  async forgetVerifyEmail(token: string): Promise<string> {
    try {
      jwt.verify(token, process.env.ADMIN_EMAIL_SECRET!);
      const admin = await this.adminRepository.findByResetToken(token);
      if (!admin) throw new ApiError('Admin not found', 404);
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
      jwt.verify(token, process.env.ADMIN_EMAIL_SECRET!);
      const admin = await this.adminRepository.findByResetToken(token);
      if (!admin) throw new ApiError('Admin not found', 404);
      await this.adminRepository.update(admin._id as string, {
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
  async logout(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, process.env.ADMIN_REFRESH_TOKEN_SECRET!) as {
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
}
