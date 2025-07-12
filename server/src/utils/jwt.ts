import jwt, { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';
import { IUserModel } from '../infrastructure/model/user.model';
import { IAdminModel } from '../infrastructure/model/adminModel';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload extends DefaultJwtPayload {
  id: string;
  email: string;
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ADMIN_ACCESS_TOKEN_SECRET = process.env.ADMIN_ACCESS_TOKEN_SECRET!;
const ADMIN_REFRESH_TOKEN_SECRET = process.env.ADMIN_REFRESH_TOKEN_SECRET!;

export const generateAccessToken = (user: IUserModel): string => {
  return jwt.sign({ id: user._id, email: user.email }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

export const generateAdminAccessToken = (admin: IAdminModel): string => {
  return jwt.sign({ id: admin._id, email: admin.email }, ADMIN_ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (user: IUserModel): string => {
  return jwt.sign({ id: user._id, email: user.email }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

export const generateAdminRefreshToken = (admin: IAdminModel): string => {
  return jwt.sign({ id: admin._id, email: admin.email }, ADMIN_REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export const verifyAdminAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, ADMIN_ACCESS_TOKEN_SECRET) as JwtPayload;
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

export const verifyAdminRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, ADMIN_REFRESH_TOKEN_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};
