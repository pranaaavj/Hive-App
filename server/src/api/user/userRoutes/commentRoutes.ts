import { Router } from 'express';
import { CommentController } from '../userControllers/commentController';
import { authMiddleware } from '../../../middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

export function setupCommentRoutes(commentController: CommentController): Router {
  const router = Router();

  const commentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 comments per minute per user
    keyGenerator: (req: any) => req.user?.userId || req.ip,
  });

  router.post('/', authMiddleware, commentLimiter, commentController.createComment);
  router.get('/post/:postId', commentController.getCommentsByPostId);
  router.get('/replies/:commentId', commentController.getReplies);
  router.delete('/:commentId', authMiddleware, commentController.deleteComment);

  return router;
}
