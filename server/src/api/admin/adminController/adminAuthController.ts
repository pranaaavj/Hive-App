import { AdminService } from '../../../application/usecases/admin.service';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../../utils/apiError';

export class AdminController {
  constructor(private adminService: AdminService) {}

  async registerAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { adminName, email, password } = req.body;
      console.log(req.body, 'body');
      await this.adminService.register({ adminName, email, password });
      res.status(200).json({ success: true, message: 'new admin created' });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { adminAccessToken, adminRefreshToken, admin } = await this.adminService.login({
        email,
        password,
      });
      res.cookie('adminRefreshToken', adminRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        success: true,
        message: 'Admin logged in successfully',
        adminAccessToken,
        admin: {
          _id: admin._id,
          adminName: admin.adminName,
          email: admin.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const redirectUrl = await this.adminService.verifyEmail(token);
      res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies.refreshToken;
      console.log(token, 'token');
      if (!token) throw new ApiError('No Refresh Token', 401);
      const accessToken = await this.adminService.refreshToken(token);
      res.status(200).json({
        success: true,
        message: 'token refreshed successfully',
        data: { accessToken },
      });
    } catch (error) {
      next(error);
    }
  }
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await this.adminService.passwordResetEmail(email);
      res.status(200).json({ success: true, message: 'password reset mail has been sent' });
    } catch (error) {
      next(error);
    }
  }

  async forgotVerifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      console.log(token, ' token from the forgotVerifyEmail');
      const redirectUrl = await this.adminService.forgetVerifyEmail(token);
      res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query;
      const { password } = req.body;
      if (typeof token !== 'string') {
        throw new ApiError('Invalid token', 400);
      }
      await this.adminService.resetPassword(token, password);
      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies.refreshToken;
      if (!token) {
        throw new ApiError('No refresh token provided', 401);
      }
      await this.adminService.logout(token);
      res.clearCookie('adminRefreshToken');
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }
}
