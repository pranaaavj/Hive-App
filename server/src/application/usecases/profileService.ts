import { SearchUsers } from "../../domain/entities/profileEntity";
import { ProfileSummary } from "../../domain/entities/user.entity";
import { IUserModel } from "../../infrastructure/model/user.model";
import { ProfileRepository } from "../repositories/profileRepository";

export class ProfileService {
        constructor(private profileRepository: ProfileRepository) {}

    async updateProfilePicture(userId: string, imageUrl: string): Promise<IUserModel> {
        const updatedUser = await this.profileRepository.updateProfileImage(userId, imageUrl)

        if (!updatedUser) {
            throw new Error('User not found or could not update profile image');
          }

          return updatedUser as IUserModel;

    }
    async profileDetails(userId: string, reqUser: string) : Promise<ProfileSummary> {
        const user = await this.profileRepository.findById(userId, reqUser)
        console.log(user)
        if (!user) {
            throw new Error('User not found or could not update profile image');
          }
          return user as ProfileSummary
    }
    async followUser(userId: string, followingUserId: string): Promise<ProfileSummary> {
        const user = await this.profileRepository.followUser(userId, followingUserId)

        if(!user) {
            throw new Error("User Not found or could not follow the User")
        }

        return user as ProfileSummary
    }
    async searchUsers(query: string) : Promise<SearchUsers> {
        const searchedUsers = await this.profileRepository.searchUsersByUsername(query)

        return searchedUsers as SearchUsers
    }
    async unfollowUser(userId: string, unfollowUserId: string): Promise<ProfileSummary> {
        const user = await this.profileRepository.unfollowUser(userId, unfollowUserId)

        if(!user) {
            throw new Error("User Not found or could not follow the User")
        }

        return user as ProfileSummary
    }

}