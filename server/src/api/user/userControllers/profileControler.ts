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

  unfollowUser = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId as string;
      const unfollowUserId = req.query.userId as string;

      const updatedUser = await this.profileService.unfollowUser(userId, unfollowUserId);

      if (!updatedUser) {
        res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  };
  updateProfile = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const updatedData = req.body.updatedData;
      console.log(userId);
      console.log(updatedData);

      if (!userId) {
        throw new ApiError('User not authorised', 401);
      }

      if (!updatedData || typeof updatedData !== 'object') {
        throw new ApiError('Invalid update data', 400);
      }

      const updatedUser = await this.profileService.updateProfile(userId, updatedData);

      res.status(200).json({
        message: 'Profile updated successfully',
        profile: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };
  getFollowing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {

    try {
      const reqUser = req.user?.userId
      if(!reqUser) {
        throw new ApiError("user not authorised", 401)
      }
      const userId = req.query?.userId as string
      
      const followingUsers = await this.profileService.followingUsers(userId)
  
        res.status(200).json(followingUsers)
    } catch (error: any) {
        next(new ApiError(error.message || "Failed to fetch following users", error.statusCode || 500))
    }

    
  };
  getFollowers = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {

    try {
      const reqUser = req.user?.userId
      if(!reqUser) {
        throw new ApiError("user not authorised", 401)
      }
      const userId = req.query?.userId as string
      
      const followedUsers = await this.profileService.followedUsers(userId)
  
        res.status(200).json(followedUsers)
    } catch (error: any) {
        next(new ApiError(error.message || "Failed to fetch followed users", error.statusCode || 500))
    }

    
  };
  usernameAndProfile = async(req: RequestWithUser, res: Response, next: NextFunction) : Promise<void> => {
    try {
      const validUser = req.user?.userId
    if(!validUser) {
      throw new ApiError("user not authorised", 401)
    }
    const userId = req.params.userId || validUser
    const usernameProfile =  await this.profileService.usernameAndProfile(userId)

    if(!usernameProfile) {
      throw new ApiError("User not found", 404)
    }
    res.status(200).json(usernameProfile)
    } catch (error) {
      next(error)
    }
  }
}
