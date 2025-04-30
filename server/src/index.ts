// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import userRoutes from './api/user/user.route';
import { errorHandler } from './middleware/error.middleware';
import { connectDB, disconnectDB } from './infrastructure/db/connect';

dotenv.config();

const app = express();
app.use(morgan('dev')); 
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
const port = process.env.PORT || 5001
app.use('/api/user', userRoutes);
app.use(errorHandler);

const startServer = async () => {
  try {
    // 🧠 Connect DB first
    await connectDB();
    
    const server = app.listen(port, () => {
      console.log('🚀 Server running at http://localhost:5001');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(async () => {
        await disconnectDB();
        console.log('Server closed. Process terminated.');
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      server.close(async () => {
        await disconnectDB();
        console.log('Server closed. Process terminated.');
      });
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();