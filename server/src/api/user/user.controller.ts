// import jwt from "jsonwebtoken"
import { Request, Response } from 'express';
import { UserService } from '../../application/usecases/user.service';

const userService = new UserService();

export class UserController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      const user = await userService.register(userData);
      res.status(201).json({ message: 'User registered please verify Email' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Unknown error occurred' });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
  try {
    const credentials = req.body;
    console.log(credentials,'from the login')
    const { accessToken, refreshToken, user } = await userService.login(credentials);

    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "User logged in successfully",
      accessToken, user
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Unknown error occurred" });
    }
  }
}

  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const {token} = req.params
      const redirectUrl = await userService.verifyEmail(token)
      res.redirect(redirectUrl);

      
    } catch (error: any) {
      res.status(400).json({ msg: error.message || 'Invalid or expired token' });
    }
  }
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies.refreshToken;

      const accessToken = userService.refreshToken(token) as any;
    res.json({ accessToken });
    } catch (error) {
      
    }

  }
async forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const {email} = req.body
    await userService.passwordResetEmail(email)
    res.status(200).json({ message: "Password reset email sent." });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to send reset email." });
  }
}
async forgotVerifyEmail(req: Request, res: Response): Promise<void> {
  try {
    console.log("req comes")
    const {token} = req.params
    console.log(token, "Token")
    const redirectUrl = await userService.forgotVerifyEmail(token)
    res.redirect(redirectUrl)
  } catch (error: any) {
    res.status(400).json({ msg: error.message || 'Invalid or expired token' }); 
  }
}
async resetPasword(req: Request, res: Response): Promise<void> {
  try {
    const {token} = req.query
    const {password} = req.body
    await userService.resetPassword(token as string, password)
    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to reset password." });
    
  }
  
}
  
}
