// middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(400).json({ error: err.message || 'Something went wrong' });
};
