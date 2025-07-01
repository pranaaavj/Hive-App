import { Types } from 'mongoose';
import { SearchUsers } from '../../domain/entities/profileEntity';
import { ProfileSummary, UsernameProfile } from '../../domain/entities/user.entity';
import { IUserModel } from '../../infrastructure/model/user.model';
import { ApiError } from '../../utils/apiError';
import { createAndEmitNotification } from '../../utils/sendNotification';
import { ProfileRepository } from '../repositories/profileRepository';

export class ProfileService {
  constructor(private profileRepository: ProfileRepository) {}

  async updateProfilePicture(userId: string, imageUrl: string): Promise<IUserModel> {
    const updatedUser = await this.profileRepository.updateProfileImage(userId, imageUrl);

    if (!updatedUser) {
      throw new Error('User not found or could not update profile image');
    }

    return updatedUser as IUserModel;
  }
  async profileDetails(userId: string, reqUser: string): Promise<ProfileSummary> {
    const user = await this.profileRepository.findById(userId, reqUser);
    console.log(user);
    if (!user) {
      throw new Error('User not found or could not update profile image');
    }
    return user as ProfileSummary;
  }
  async followUser(userId: string, followingUserId: string): Promise<ProfileSummary> {
    const user = await this.profileRepository.followUser(userId, followingUserId);

    if (!user) {
      throw new Error('User Not found or could not follow the User');
    }


    if(followingUserId !== userId) {
      
      await createAndEmitNotification({
        userId: new Types.ObjectId(followingUserId),
        fromUser: new Types.ObjectId(userId),
        type: "follow",
        message: "Started Following You",
    })
    

    }

    return user as ProfileSummary;
  }
  async searchUsers(query: string): Promise<SearchUsers> {
    const searchedUsers = await this.profileRepository.searchUsersByUsername(query);

    return searchedUsers as SearchUsers;
  }
  async unfollowUser(userId: string, unfollowUserId: string): Promise<ProfileSummary> {
    const user = await this.profileRepository.unfollowUser(userId, unfollowUserId);

    if (!user) {
      throw new Error('User Not found or could not follow the User');

    }

    return user as ProfileSummary;
  }
  async updateProfile(
    userId: string,
    updatedData: { username: string; bio: string; profilePicture: string },
  ): Promise<ProfileSummary> {
    const userIdTaken = await this.profileRepository.findByUsername(updatedData.username)

    if(userIdTaken && userIdTaken._id.toString() !== userId) {
        throw new ApiError("username already taken", 409)
    }
    const updatedUser = await this.profileRepository.updateProfile(userId, updatedData);
  if (!updatedUser) throw new Error('Failed to update profile');

  return updatedUser
  }
  async followingUsers(userId: string) : Promise<ProfileSummary[]> {
    try {
      const users = await this.profileRepository.findFollowingUsers(userId);
  
      if (!users) {
        throw new Error("No following users found.");
      }
  
      return users as ProfileSummary[]
    } catch (error: any) {
      throw new Error(`Failed to fetch following users: ${error.message || error}`);
    }
  }

  async followedUsers(userId: string) : Promise<ProfileSummary[]> {
    try {
      const users = await this.profileRepository.findFollowedUsers(userId);
  
      if (!users) {
        throw new Error("No followed users found.");
      }
  
      return users as ProfileSummary[]
    } catch (error: any) {
      throw new Error(`Failed to fetch followed users: ${error.message || error}`);
    }
  }
  async usernameAndProfile(userId: string) : Promise<UsernameProfile | null> {
    const usernameProfile = this.profileRepository.usernameProfile(userId)

    return usernameProfile
  }
}
