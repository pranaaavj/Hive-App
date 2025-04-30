import { Request, Response } from 'express';
import { UserService } from '../../application/usecases/user.service';
import { ILoginUserDTO, IRegisterUserDTO } from '../../domain/entities/user.entity';

const userService = new UserService();

export class UserController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: IRegisterUserDTO = req.body;

      if (!userData.email || !userData.password || !userData.name) {
        res.status(400).json({ error: 'Name, email, and password are required' });
        return;
      }

      const response = await userService.register(userData);

      res.status(201).json(response); // { message: 'Verification email sent successfully' }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Registration failed' 
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: ILoginUserDTO = req.body;

      if (!credentials.email || !credentials.password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const { accessToken, refreshToken, user } = await userService.login(credentials);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ accessToken, user });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ 
        error: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ error: 'No refresh token provided' });
        return;
      }

      const newAccessToken = await userService.refreshAccessToken(refreshToken);
      res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(403).json({ 
        error: error instanceof Error ? error.message : 'Invalid refresh token' 
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Logout failed' 
      });
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({ error: 'Verification token is required' });
        return;
      }

      const user = await userService.verifyEmail(token);

      res.status(200).json({ message: 'Email verified successfully', user });
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Email verification failed' 
      });
    }
  }

  async resendVerificationEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      const response = await userService.resendVerificationEmail(email);
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Resend failed' 
      });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }
  
      const result = await userService.forgotPassword(email);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Error occurred' });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const { password } = req.body;
  
      if (!token || !password) {
        res.status(400).json({ error: 'Token and new password are required' });
        return;
      }
      const result = await userService.resetPassword(token, password);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Reset failed' });
    }
  }
}
