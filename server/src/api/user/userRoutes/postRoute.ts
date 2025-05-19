import { Router } from "express";
import { PostController } from "../userControllers/postController";
import { authMiddleware } from "../../../middleware/auth.middleware";
import rateLimit from 'express-rate-limit'


export function setupPostRoutes(postController: PostController): Router {
    const router = Router();
  
    // const createPostLimiter = rateLimit({
    //   windowMs: 60 * 1000, // 1 minute
    //   max: 5, // 5 posts per minute per user
    //   keyGenerator: (req: any) => req.user?.userId || req.ip,
    // });
  
    router.post('/add-post', authMiddleware, postController.createPost);
    router.get('/user-posts',authMiddleware, postController.getAllPosts);
    router.get('/:id', postController.getPostById);
    router.get('/user', authMiddleware, postController.getUserPosts);
    router.delete('/:id', authMiddleware, postController.deletePost);
    router.post('/:id/like', authMiddleware, postController.likePost);
    router.post('/:id/unlike', authMiddleware, postController.unlikePost);
  
    return router;
  }

