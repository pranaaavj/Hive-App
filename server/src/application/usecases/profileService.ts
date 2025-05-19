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
    async profileDetails(userId: string) : Promise<ProfileSummary> {
        const user = await this.profileRepository.findById(userId)
        console.log(user)
        if (!user) {
            throw new Error('User not found or could not update profile image');
          }
          return user as ProfileSummary
    }

}