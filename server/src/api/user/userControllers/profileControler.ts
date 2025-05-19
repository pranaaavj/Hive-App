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
      const imageUrl  = req.body.imageUrl
      if (!userId) {
        throw new ApiError('User not Authenticated', 401);
      }
      if (!imageUrl) {
        throw new ApiError('Image URL is required', 400);
      }
      const updatedUser = await this.profileService.updateProfilePicture(userId, imageUrl)

      res.status(200).json({message: "User updted successfully", user: updatedUser})
    } catch (error) {
        next(error)
    }
  };
  profileDetails = async(req: RequestWithUser, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const userId = req?.user?.userId
    if(!userId) {
        throw new ApiError('User not Authenticated', 401)
    }

    const profileDetails = await this.profileService.profileDetails(userId)
    if (!profileDetails) {
        res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(profileDetails);
        
    } catch (error) {
        next(error)
    }
    
  }
}
