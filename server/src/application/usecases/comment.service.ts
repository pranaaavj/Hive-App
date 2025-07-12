import { Comment, IComment } from '../../domain/entities/commentEntity';
import { CommentRepository } from '../repositories/commentRepository';
import { PostRepository } from '../repositories/postRepository';
import { ApiError } from '../../utils/apiError';
import { ICommentModel } from '../../infrastructure/model/commentModel';
import { IPostModel } from '../../infrastructure/model/postModel';
import { getIO } from '../../infrastructure/websocket/socket';
import { createAndEmitNotification } from '../../utils/sendNotification';
import { Types } from 'mongoose';

export class CommentService {
  constructor(
    private commentRepository: CommentRepository,
    private postRepository: PostRepository,
  ) {}

  async createComment(
    postId: string,
    userId: string,
    content: string,
    parentCommentId?: string,
  ): Promise<ICommentModel> {
    try {
      const post = await this.postRepository.findById(postId);
      if (!post || post.isDeleted) {
        throw new ApiError('Post not found', 404);
      }
      let depth = 0;
      if (parentCommentId) {
        const parentComment = await this.commentRepository.findById(parentCommentId);
        if (!parentComment || parentComment.isDeleted) {
          throw new ApiError('Parent comment not found', 404);
        }
        if (parentComment.depth >= 3) {
          throw new ApiError('Maximum reply depth reached', 400);
        }
        depth = parentComment.depth + 1;
      }

      const commentData: IComment = {
        postId,
        userId,
        content,
        parentCommentId,
        depth,
        isDeleted: false,
      };

      const comment = Comment.create(commentData);
      const savedComment = await this.commentRepository.save(comment);
      const userAndPost = await this.postRepository.getUserByPost(postId);

      await createAndEmitNotification({
        userId: new Types.ObjectId(userAndPost?.userId),
        fromUser: new Types.ObjectId(userId),
        type: 'comment',
        postId: new Types.ObjectId(postId),
        message: `commented ${savedComment.content}`,
        postImage: userAndPost?.imageUrls?.[0],
      });
      await this.postRepository.updateCommentCount(postId, 1);
      return savedComment;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error creating comment', 500);
    }
  }

  async getCommentsByPostId(
    postId: string,
    page: number = 0,
    limit: number = 10,
  ): Promise<ICommentModel[]> {
    try {
      const post = await this.postRepository.findById(postId);
      if (!post || post.isDeleted) {
        throw new ApiError('Post not found', 404);
      }
      return await this.commentRepository.findByPostId(postId, page, limit);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error fetching comments', 500);
    }
  }

  async getReplies(
    parentCommentId: string,
    page: number = 0,
    limit: number = 10,
  ): Promise<ICommentModel[]> {
    try {
      const parentComment = await this.commentRepository.findById(parentCommentId);
      if (!parentComment || parentComment.isDeleted) {
        throw new ApiError('Parent comment not found', 404);
      }
      return await this.commentRepository.findReplies(parentCommentId, page, limit);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error fetching replies', 500);
    }
  }

  async deleteComment(
    commentId: string,
    userId: string,
  ): Promise<{
    success: boolean;
    comment: ICommentModel;
    deletionType: 'soft' | 'hard';
    message: string;
  }> {
    try {
      const comment = await this.commentRepository.findById(commentId);
      if (!comment || comment.isDeleted) {
        throw new ApiError('Comment not found', 404);
      }

      if (comment.userId._id.toString() !== userId) {
        throw new ApiError('You are not authorized to delete this comment', 403);
      }

      const hasReplies = await this.commentRepository.hasReplies(commentId);
      let result: {
        success: boolean;
        comment: ICommentModel;
        deletionType: 'soft' | 'hard';
        message: string;
      };

      if (hasReplies) {
        const softDeletedComment = await this.commentRepository.softDelete(commentId, userId);
        if (!softDeletedComment) throw new ApiError('Failed to soft delete comment', 500);

        result = {
          success: true,
          comment: softDeletedComment,
          deletionType: 'soft',
          message: 'Comment marked as deleted but preserved for replies',
        };
        getIO().to(comment.postId.toString()).emit('commentSoftDeleted', {
          commentId,
          updatedContent: '[Comment deleted]',
          deletedBy: userId,
        });
      } else {
        const hardDeletedComment = await this.commentRepository.hardDelete(commentId);
        if (!hardDeletedComment) throw new ApiError('Failed to hard delete comment', 500);

        result = {
          success: true,
          comment: hardDeletedComment,
          deletionType: 'hard',
          message: 'Comment permanently deleted',
        };
        getIO()
          .to(comment.postId.toString())
          .emit('commentHardDeleted', { commentId, postId: comment.postId.toString() });
        await this.postRepository.updateCommentCount(comment.postId.toString(), -1);
      }

      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error deleting comment', 500);
    }
  }
}
