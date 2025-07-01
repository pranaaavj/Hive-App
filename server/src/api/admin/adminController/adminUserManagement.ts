import { NextFunction, Request, Response } from 'express';
import { AdminUserManagementService } from '../../../application/usecases/adminUserManagement.service';
import { ApiError } from '../../../utils/apiError';

export class AdminUserManagementController {
  constructor(private adminUserManagementService: AdminUserManagementService) {}

  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const allUsers = await this.adminUserManagementService.getAllUsers();
      if (!allUsers) {
        throw new ApiError('failed to fetch all the users', 400);
      }
      res.status(200).json({ success: true, message: 'users fetched', allUsers });
    } catch (error) {
      next(error);
    }
  }
  async suspendUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const { status } = req.body;
      const suspendedUser = await this.adminUserManagementService.suspendUser(userId, status);
      if (!suspendedUser) {
        throw new ApiError('failed to fetch suspended user', 400);
      }
      res.status(200).json({ success: true, message: 'successfully fetched suspended user' });
    } catch (error) {
      next(error);
    }
  }

  async userCountAndSuspendCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userCount, suspendedUser } =
        await this.adminUserManagementService.userCountAndSuspendCount();
      // if(!userCount && !suspendedUser){
      //      throw new ApiError('no users fount and suspended user found',400)
      // }
      res
        .status(200)
        .json({
          success: true,
          message: 'total users and suspended user fetched',
          userCount,
          suspendedUser,
        });
    } catch (error) {
      next(error);
    }
  }

  async getAllPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const posts = await this.adminUserManagementService.getAllPosts();
      if (!posts) throw new ApiError('no post found', 400);
      res.status(200).json({ success: true, message: 'all the post fetched', posts });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {postId} = req.params;
      const deleted = await this.adminUserManagementService.deletePost(postId);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Post not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'message deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async postCount(req:Request,res:Response,next:NextFunction):Promise<void>{
    try {
      const {totalPosts} = await this.adminUserManagementService.postCount()
      res.status(200).json({success:true,message:'Total post count fetched successfully',totalPosts})
    } catch (error) {
      next(error)
    }
  }
  async searchUser(req:Request,res:Response,next:NextFunction):Promise<void>{
    try {
      const q = String(req.query.q || "").trim();
        if (!q) {
         res.status(400).json({ success: false, message: "Query missing" });
         return
      }
      const user = await this.adminUserManagementService.searchUser(q)
      res.status(200).json({success:true,user})
    } catch (error) {
      next(error)
    }
  }
}
