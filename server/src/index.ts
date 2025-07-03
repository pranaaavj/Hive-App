// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { setupWebSocket } from './infrastructure/websocket/socket';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error.middleware';
import { connectDB, disconnectDB } from './infrastructure/db/connect';
import { router } from './api/user/userRoutes/routes';


dotenv.config();

const app = express();
const httpServer = createServer(app);
setupWebSocket(httpServer);
app.use(morgan('dev')); 
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://frontend:5173'], 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

console.log('heey')
const port = process.env.PORT || 5001

app.use("/api", router)
app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.use(errorHandler)

const startServer = async () => {
  try {
    // 🧠 Connect DB first
    await connectDB();
    
    httpServer.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      httpServer.close(async () => {
        await disconnectDB();
        console.log('Server closed. Process terminated.');
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      httpServer.close(async () => {
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