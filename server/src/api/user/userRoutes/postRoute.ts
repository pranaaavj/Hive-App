import { Router } from "express";
import { PostController } from "../userControllers/postController";
import { verifyAccessToken } from "../../../middleware/auth.middleware";
import rateLimit from 'express-rate-limit'


export function setupPostRoutes(postController: PostController): Router {
    const router = Router();
  
    const createPostLimiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 5, // 5 posts per minute per user
      keyGenerator: (req: any) => req.user?.userId || req.ip,
    });
  
    router.post('/', verifyAccessToken, createPostLimiter, postController.createPost);
    router.get('/', postController.getAllPosts);
    router.get('/:id', postController.getPostById);
    router.get('/user', verifyAccessToken, postController.getUserPosts);
    router.delete('/:id', verifyAccessToken, postController.deletePost);
    router.post('/:id/like', verifyAccessToken, postController.likePost);
    router.post('/:id/unlike', verifyAccessToken, postController.unlikePost);
  
    return router;
  }

