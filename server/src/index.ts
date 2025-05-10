// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { setupWebSocket } from './infrastructure/websocket/socket';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import userRouter from './api/user/userRoutes/routes';
import { PostController } from './api/user/userControllers/postController';
import { CommentController } from './api/user/userControllers/commentController';
import { setupCommentRoutes } from './api/user/userRoutes/commentRoutes';
import { setupPostRoutes } from './api/user/userRoutes/postRoute'; 
import { PostService } from './application/usecases/post.service';
import { CommentService } from './application/usecases/comment.service';
import { MongoPostRepository } from './application/repositories/postRepository';
import { MongoCommentRepository } from './application/repositories/commentRepository';
import { errorHandler } from './middleware/error.middleware';
import { connectDB, disconnectDB } from './infrastructure/db/connect';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = setupWebSocket(httpServer);
app.use(morgan('dev')); 
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
const port = process.env.PORT || 5001


const postRepository = new MongoPostRepository();
const commentRepository = new MongoCommentRepository();
const postService = new PostService(postRepository);
const commentService = new CommentService(commentRepository, postRepository);
const postController = new PostController(postService);
const commentController = new CommentController(commentService);

app.use('/api', userRouter);
app.use('/posts', setupPostRoutes(postController));
app.use('/comments', setupCommentRoutes(commentController));


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