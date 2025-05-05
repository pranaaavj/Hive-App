// import jwt from "jsonwebtoken"
import { Request, Response } from 'express';
import { UserService } from '../../application/usecases/user.service';
import { ApiError } from '../../utils/apiError';

const userService = new UserService();

export class UserController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      await userService.register(userData);
      res.status(201).json({ message: "User registered successfully. Please verify your email." });
    } catch (error) {
      const statusCode = error instanceof ApiError ? error.statusCode : 500;
      const message = error instanceof Error ? error.message : "Something went wrong";
      const fields = error instanceof ApiError ? error.fields : undefined;
  
      res.status(statusCode).json({ message, fields });
    }
  }
  
  async login(req: Request, res: Response): Promise<void> {
  try {
    const credentials = req.body;

    const { accessToken, refreshToken, user } = await userService.login(credentials);

    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "User logged in successfully",
      accessToken, user : {
        id: user._id,
        username: user.username,
        email: user.email
      }
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
  async refreshToken(req: Request, res: Response): Promise<any> {
    try {
      const token = req.cookies.refreshToken;
      if(!token) {
        return res.status(401).json({message: "No refresh token"})
        
      } 
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
    console.log(token, password)
    await userService.resetPassword(token as string, password)
    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to reset password." });
    
  }
  
}
  
}
