import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { RedisClient } from '../infrastructure/cache/redis';
import { ApiError } from '../utils/apiError';
import { RequestWithUser } from '../types/RequestWithUser';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

  try {

    const authHeader = req.headers.authorization;
<<<<<<< HEAD
=======
    // console.log('Authorization header:', authHeader);
>>>>>>> develop

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new ApiError('No token provided', 401);
    }

    const redis = new RedisClient();
    const isBlacklisted = await redis.get(`blacklist:${token}`);
<<<<<<< HEAD
=======
    // console.log('Is token blacklisted:', isBlacklisted);
>>>>>>> develop
    if (isBlacklisted) {
      throw new ApiError('Token is invalid', 401);
    }

    const payload = verifyAccessToken(token);
<<<<<<< HEAD
=======
    // console.log('Payload:', payload);
>>>>>>> develop
    if (!payload) {
      throw new ApiError('Invalid token', 401);
    }

    (req as RequestWithUser).user = { userId: payload.id, email: payload.email };
    next();
  } catch (error) {
    next(error instanceof ApiError ? error   : new ApiError('Authentication failed', 401));
  }
};