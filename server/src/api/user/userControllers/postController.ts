import { Request, Response, NextFunction } from 'express';
import { PostService } from '../../../application/usecases/post.service';
import { ApiError } from '../../../utils/apiError'; 
import { RequestWithUser } from '../../../types/RequestWithUser';


  export class PostController {
    constructor(private postService: PostService) {}
  
    createPost = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        
      
      try {
        const {images, caption} = req.body
        const userId = req?.user?.userId
        if (!userId) {
          throw new ApiError('User not authenticated', 401);
        }
  
        const newPost = await this.postService.createPost(userId, images, caption);
        res.status(201).json({
          success: true,
          message: 'Post created successfully',
          data: newPost,
        });
      } catch (error) {
        next(error);
      }
    };
  
    getAllPosts = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
      try {
        const userId = req.query?.userId
        
        const posts = await this.postService.getAllPosts(userId as string);
        res.status(200).json({
          success: true,
          message: 'Posts fetched successfully',
          posts,
        });
      } catch (error) {
        next(error);
      }
    };
  
    getPostById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { id } = req.params;
        const post = await this.postService.getPostById(id);
        res.status(200).json({
          success: true,
          message: 'Post fetched successfully',
          data: post,
        });
      } catch (error) {
        next(error);
      }
    };
  
    getUserPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const userReq = req as RequestWithUser;
        const userId = userReq.user?.userId;
        const { page = 0, limit = 10 } = req.query;
  
        if (!userId) {
          throw new ApiError('User not authenticated', 401);
        }
  
        const posts = await this.postService.getUserPosts(userId, Number(page), Number(limit));
        res.status(200).json({
          success: true,
          message: 'User posts fetched successfully',
          data: posts,
        });
      } catch (error) {
        next(error);
      }
    };
  
    deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { id } = req.params;
        const userReq = req as RequestWithUser;
        const userId = userReq.user?.userId;
  
        if (!userId) {
          throw new ApiError('User not authenticated', 401);
        }
  
        await this.postService.deletePost(id, userId);
  
        res.status(200).json({
          success: true,
          message: 'Post deleted successfully',
        });
      } catch (error) {
        next(error);
      }
    };
  
    likePost = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { id } = req.params;

        const userId = req.user?.userId;
  
        if (!userId) {
          throw new ApiError('User not authenticated', 401);
        }
  
        const updatedPost = await this.postService.likePost(id, userId);
        res.status(200).json({
          success: true,
          message: 'Post liked',
          data: updatedPost,
        });
      } catch (error) {
        next(error);
      }
    };
  
    unlikePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { id } = req.params;
        const userReq = req as RequestWithUser;
        const userId = userReq.user?.userId;
  
        if (!userId) {
          throw new ApiError('User not authenticated', 401);
        }
  
        const updatedPost = await this.postService.unlikePost(id, userId);
        res.status(200).json({
          success: true,
          message: 'Post unliked',
          data: updatedPost,
        });
      } catch (error) {
        next(error);
      }
    };
  }