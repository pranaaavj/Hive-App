// import jwt from "jsonwebtoken"
import { Request, Response } from 'express';
import { UserService } from '../../application/usecases/user.service';


const userService = new UserService();

export class UserController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      const user = await userService.register(userData);
      res.status(201).json({ message: 'User registered please verify Email', user });
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
      const { accessToken, refreshToken } = await userService.login(credentials);
      res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Unknown error occurred' });
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
}