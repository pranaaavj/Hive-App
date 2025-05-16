import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../../../application/usecases/comment.service';
import { ApiError } from '../../../utils/apiError';

interface RequestWithUser extends Request {
  user?: { userId: string; email: string };
}

export class CommentController {
  constructor(private commentService: CommentService) {}

  createComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userReq = req as RequestWithUser;
      const userId = userReq.user?.userId;
      const { postId, content, parentCommentId } = req.body;

      if (!userId) {
        throw new ApiError('User not authenticated', 401);
      }

      const comment = await this.commentService.createComment(postId, userId, content, parentCommentId);

      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

  getCommentsByPostId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { postId } = req.params;
      const { page = 0, limit = 10 } = req.query;
      const comments = await this.commentService.getCommentsByPostId(postId, Number(page), Number(limit));

      res.status(200).json({
        success: true,
        message: 'Comments fetched successfully',
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  };

  getReplies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { commentId } = req.params;
      const { page = 0, limit = 10 } = req.query;
      const replies = await this.commentService.getReplies(commentId, Number(page), Number(limit));

      res.status(200).json({
        success: true,
        message: 'Replies fetched successfully',
        data: replies,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userReq = req as RequestWithUser;
      const userId = userReq.user?.userId;
      const { commentId } = req.params;

      if (!userId) {
        throw new ApiError('User not authenticated', 401);
      }

      const deletedComment = await this.commentService.deleteComment(commentId, userId);

      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
        data: deletedComment,
      });
    } catch (error) {
      next(error);
    }
  };
}