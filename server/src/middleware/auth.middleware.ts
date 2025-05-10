import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define interface for JWT payload
interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Define interface for request with user extension
interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
  }
}

export const verifyAccessToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
     res.status(401).json({ error: "Unauthorized - No token provided" }); // More descriptive
     return
  }
  
  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
    
    // Validate the decoded payload
    if (!decoded.id || !decoded.email) {
       res.status(403).json({ error: "Invalid token payload" });
       return
    }
    
    (req as RequestWithUser).user = {
      userId: decoded.id,
      email: decoded.email
    };
    
    next();
  } catch (err) {
    // Differentiate between different types of errors
    if (err instanceof jwt.TokenExpiredError) {
       res.status(401).json({ error: "Token expired" });
       return
    } else if (err instanceof jwt.JsonWebTokenError) {
       res.status(401).json({ error: "Invalid token" });
       return
    }
     res.status(500).json({ error: "Authentication failed" });
     return
  }
};