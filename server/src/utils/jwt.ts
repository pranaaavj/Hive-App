// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config()


const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}


export interface IUserPayload {
  id: string;
  email: string;
  role: string;
}

// Access token
export const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

// Refresh token
export const generateRefreshToken = (payload: JwtPayload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

// Verify access token
export const verifyAccessToken = (token: string): IUserPayload  => {
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as IUserPayload;
  return decoded;
};

// Verify refresh token
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
};
