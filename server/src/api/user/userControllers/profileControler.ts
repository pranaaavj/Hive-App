import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../../../application/usecases/profileService';
import { RequestWithUser } from '../../../types/RequestWithUser';
import { ApiError } from '../../../utils/apiError';

export class ProfileControler {
  constructor(private profileService: ProfileService) {}

  updateProfilePicture = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const imageUrl = req.body.imageUrl;
      if (!userId) {
        throw new ApiError('User not Authenticated', 401);
      }
      if (!imageUrl) {
        throw new ApiError('Image URL is required', 400);
      }
      const updatedUser = await this.profileService.updateProfilePicture(userId, imageUrl);

      res.status(200).json({ message: 'User updted successfully', user: updatedUser });
    } catch (error) {
      next(error);
    }
  };
  profileDetails = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const reqUser = req?.user?.userId;
      const userId = req?.query?.userId as string;
      if (!reqUser) {
        throw new ApiError('User not Authenticated', 401);
      }

      const profileDetails = await this.profileService.profileDetails(userId, reqUser);
      if (!profileDetails) {
        res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(profileDetails);
    } catch (error) {
      next(error);
    }
  };
  searchUsers = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new ApiError('User not Authenticated', 401);
      }
      const query = req.query.q as string;

      if (!query || query.trim() === '') {
        throw new ApiError('Search query is required', 400);
      }
      const users = await this.profileService.searchUsers(query);
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  followUser = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req?.user?.userId as string;
      const followingUserId = req.query.userId as string;

      if (!userId) {
        throw new ApiError('User not Authenticated', 401);
      }

      const updatedUser = await this.profileService.followUser(userId, followingUserId);

      if (!updatedUser) {
        res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  };

  unfollowUser = async(req: RequestWithUser, res: Response, next: NextFunction) : Promise<void> => {
    try {
      const userId = req.user?.userId as string
      const unfollowUserId = req.query.userId as string

      const updatedUser = await this.profileService.unfollowUser(userId, unfollowUserId)

      if (!updatedUser) {
        res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
}
