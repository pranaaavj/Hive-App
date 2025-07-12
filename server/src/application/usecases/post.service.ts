import { IPost, Post } from '../../domain/entities/postEntity';
import { PostRepository } from '../repositories/postRepository';
import { ApiError } from '../../utils/apiError';
import { IPostModel } from '../../infrastructure/model/postModel';
import { createAndEmitNotification } from '../../utils/sendNotification';
import { Types } from 'mongoose';

export class PostService {
  constructor(private postRepository: PostRepository) {}

  async createPost(userId: string, imageUrls: string[], caption?: string): Promise<IPostModel> {
    try {
      const postData: IPost = {
        userId,
        caption,
        imageUrls,
        likes: [],
        likeCount: 0,
        commentCount: 0,
        status: 'active',
        isDeleted: false,
      };

      const post = Post.create(postData);
      return await this.postRepository.save(post);
    } catch (error) {
      if (error instanceof Error && error.message === 'Post must have at least one image') {
        throw new ApiError('Post must have at least one image', 400);
      }
      throw new ApiError('Error creating post', 500);
    }
  }

  async getAllPosts(userId: string): Promise<IPostModel[]> {
    try {
      return await this.postRepository.findAll(userId);
    } catch (error) {
      throw new ApiError('Error fetching posts', 500);
    }
  }

  async getPostById(id: string): Promise<IPostModel> {
    try {
      const post = await this.postRepository.findById(id);
      if (!post) {
        throw new ApiError('Post not found', 404);
      }
      return post;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error fetching post', 500);
    }
  }

  async deletePost(id: string, requestUserId: string): Promise<IPostModel> {
    try {
      const post = await this.postRepository.findById(id);
      if (!post) {
        throw new ApiError('Post not found', 404);
      }
      if (post.userId.toString() !== requestUserId) {
        throw new ApiError('You are not authorized to delete this post', 403);
      }
      const deletedPost = await this.postRepository.delete(id);
      if (!deletedPost) {
        throw new ApiError('Error deleting post', 500);
      }
      return deletedPost;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error deleting post', 500);
    }
  }

  async likePost(postId: string, userId: string): Promise<IPostModel> {
    try {
      const post = await this.postRepository.likePost(postId, userId);
      if (!post) {
        throw new ApiError('Post not found or already liked', 400);
      }

      const postAndUser = await this.postRepository.getUserByPost(postId);

      if (postAndUser?.userId.toString() !== userId.toString()) {
        await createAndEmitNotification({
          userId: new Types.ObjectId(postAndUser?.userId),
          fromUser: new Types.ObjectId(userId),
          type: 'like',
          postId: new Types.ObjectId(postId),
          message: 'liked your post',
          postImage: postAndUser?.imageUrls?.[0],
        });
      }

      return post;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error liking post', 500);
    }
  }

  async unlikePost(postId: string, userId: string): Promise<IPostModel> {
    try {
      const post = await this.postRepository.unlikePost(postId, userId);
      if (!post) {
        throw new ApiError('Post not found or not liked', 400);
      }
      return post;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error unliking post', 500);
    }
  }

  async getUserPosts(userId: string, page: number = 0, limit: number = 10): Promise<IPostModel[]> {
    try {
      return await this.postRepository.findByUserId(userId, page, limit);
    } catch (error) {
      throw new ApiError('Error fetching user posts', 500);
    }
  }
}
