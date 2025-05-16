import { Comment, IComment } from '../../domain/entities/commentEntity';
import { CommentRepository } from '../repositories/commentRepository'; 
import { PostRepository } from '../repositories/postRepository'; 
import { ApiError } from '../../utils/apiError';
import { ICommentModel } from '../../infrastructure/model/commentModel';
import { IPostModel } from '../../infrastructure/model/postModel';


export class CommentService {
  constructor(private commentRepository: CommentRepository, private postRepository: PostRepository) {}

  async createComment(postId: string,userId: string,content: string,parentCommentId?: string): Promise<ICommentModel> {
    try {
      const post = await this.postRepository.findById(postId);
      if (!post || post.isDeleted) {
        throw new ApiError('Post not found', 404);
      }

      if (parentCommentId) {
        const parentComment = await this.commentRepository.findById(parentCommentId);
        if (!parentComment || parentComment.isDeleted) {
          throw new ApiError('Parent comment not found', 404);
        }
        if (parentComment.depth >= 3) {
          throw new ApiError('Maximum reply depth reached', 400);
        }
      }

      const commentData: IComment = {
        postId,
        userId,
        content,
        parentCommentId,
        likeCount:0,
        depth: parentCommentId ? (await this.commentRepository.findById(parentCommentId))?.depth! + 1 : 0,
        isDeleted: false,
      };

      const comment = Comment.create(commentData);
      const savedComment = await this.commentRepository.save(comment);

      await this.postRepository.updateCommentCount(postId, 1);
      return savedComment;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error creating comment', 500);
    }
  }

  async getCommentsByPostId(postId: string, page: number = 0, limit: number = 10): Promise<ICommentModel[]> {
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

  async getReplies(parentCommentId: string, page: number = 0, limit: number = 10): Promise<ICommentModel[]> {
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

  async deleteComment(commentId: string, userId: string): Promise<ICommentModel> {
    try {
      const comment = await this.commentRepository.findById(commentId);
      if (!comment || comment.isDeleted) {
        throw new ApiError('Comment not found', 404);
      }
      if (comment.userId.toString() !== userId) {
        throw new ApiError('You are not authorized to delete this comment', 403);
      }

      const deletedComment = await this.commentRepository.delete(commentId);
      if (!deletedComment) {
        throw new ApiError('Error deleting comment', 500);
      }

      await this.postRepository.updateCommentCount(comment.postId.toString(), -1);
      return deletedComment;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error deleting comment', 500);
    }
  }
}