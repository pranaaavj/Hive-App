// src/utils/jwt.ts
import jwt, { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';
import { IUserModel } from '../infrastructure/model/user.model'; 
import dotenv from 'dotenv';

dotenv.config();

// Custom payload type for our JWTs
interface JwtPayload extends DefaultJwtPayload {
  id: string;
  email: string;
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

// Generate Access Token
export const generateAccessToken = (user: IUserModel): string => {
  return jwt.sign(
    { id: user.id, email: user.email }, 
    ACCESS_TOKEN_SECRET, 
    { expiresIn: 10 }
  );
};

// Generate Refresh Token
export const generateRefreshToken = (user: IUserModel): string => {
  return jwt.sign(
    { id: user.id, email: user.email }, 
    REFRESH_TOKEN_SECRET, 
    { expiresIn: '7d' }
  );
};

// Verify Access Token with error handling
export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
  } catch (error) {
    console.error('Invalid access token:', error);
    return null;
  }
};

// Verify Refresh Token with error handling
export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
  } catch (error) {
    console.error('Invalid refresh token:', error);
    return null;
  }
};
