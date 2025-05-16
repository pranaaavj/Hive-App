// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { setupWebSocket } from './infrastructure/websocket/socket';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
// import { setupRoutes } from './api/user/userRoutes/routes'; 
import { setupUserRoutes } from './api/user/userRoutes/authRoute';
import { UserController } from './api/user/userControllers/authController'; 
import { UserService } from './application/usecases/user.service'; 
import { MongoUserRepository } from './application/repositories/user.repository'; 
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
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://frontend:5173'], 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

console.log('heey')
const port = process.env.PORT || 5001

const userRepository = new MongoUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const postRepository = new MongoPostRepository();
const postService = new PostService(postRepository);
const postController = new PostController(postService);

const commentRepository = new MongoCommentRepository();
const commentService = new CommentService(commentRepository, postRepository);
const commentController = new CommentController(commentService);

app.use('/api/auth', setupUserRoutes(userController));
app.use('/posts', setupPostRoutes(postController));
app.use('/comments', setupCommentRoutes(commentController));


app.use(errorHandler);

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