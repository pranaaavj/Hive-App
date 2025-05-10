import { Router } from 'express';
import { CommentController } from '../userControllers/commentController';
import { verifyAccessToken } from '../../../middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

export function setupCommentRoutes(commentController: CommentController): Router {
  const router = Router();

  const commentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 comments per minute per user
    keyGenerator: (req: any) => req.user?.userId || req.ip,
  });

  router.post('/', verifyAccessToken, commentLimiter, commentController.createComment);
  router.get('/post/:postId', commentController.getCommentsByPostId);
  router.get('/replies/:commentId', commentController.getReplies);
  router.delete('/:commentId', verifyAccessToken, commentController.deleteComment);

  return router;
}