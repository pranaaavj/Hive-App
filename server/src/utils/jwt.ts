import jwt, { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';
import { IUserModel } from '../infrastructure/model/user.model'; 
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload extends DefaultJwtPayload {
  id: string;
  email: string;
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export const generateAccessToken = (user: IUserModel): string => {
  return jwt.sign(
    { id: user._id, email: user.email }, 
    ACCESS_TOKEN_SECRET, 
    { expiresIn: 10 }
  );
};

export const generateRefreshToken = (user: IUserModel): string => {
  return jwt.sign(
    { id: user._id, email: user.email }, 
    REFRESH_TOKEN_SECRET, 
    { expiresIn: '7d' }
  );
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};
