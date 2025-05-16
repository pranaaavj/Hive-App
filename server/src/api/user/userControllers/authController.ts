
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../../application/usecases/user.service'; 
import { ApiError } from '../../../utils/apiError'; 

export class UserController {
  constructor(private userService: UserService) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log('userService:', this.userService);
    try {
      const { username, email, password } = req.body;
      await this.userService.register({ username, email, password });
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your email.',
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier, password } = req.body;
      const { accessToken, refreshToken, user } = await this.userService.login({ identifier, password });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: {
          accessToken,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
          },
        },
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
      await this.userService.logout(token);
      res.clearCookie('refreshToken');
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const redirectUrl = await this.userService.verifyEmail(token);
      res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies.refreshToken;
      if (!token) {
        throw new ApiError('No refresh token', 401);
      }
      const accessToken = await this.userService.refreshToken(token);
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: { accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await this.userService.passwordResetEmail(email);
      res.status(200).json({
        success: true,
        message: 'Password reset email sent.',
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotVerifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const redirectUrl = await this.userService.forgotVerifyEmail(token);
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
      await this.userService.resetPassword(token, password);
      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}
