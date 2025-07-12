// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message,
      fields: err.fields ?? null,
    });
    return;
  }

  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
};
