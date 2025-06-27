import {Types } from 'mongoose';
import { UserModel} from '../../infrastructure/model/user.model';

export interface UserManagement {
  _id: Types.ObjectId;
  username: string;
  email: string;
  profilePicture?: string;
  status: boolean;
  postsCount: number;
  followers: number;
  createdAt: Date;
}

export interface AdminUserManagementRepository {
  getAllUsers(): Promise<UserManagement[] | null>;
  suspendUser(userId:string,status:boolean):Promise<UserManagement | null>
}

export class MongoAdminUserManagementRepository implements AdminUserManagementRepository {

    
  async getAllUsers(): Promise<UserManagement[] | null> {
    const allUsers = await UserModel.find()
      .select('_id username email profilePicture status postsCount followers createdAt')
      .lean();

      console.log(this.getAllUsers,'from the user management repo')
    return allUsers.map((user) => ({
      _id: user._id as Types.ObjectId,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture ?? "",
      status: user.status,
      postsCount: user.postsCount,
      followers: user.followers.length,
      createdAt: user.createdAt,
    }));
  }

  async suspendUser(userId: string,status:boolean): Promise<UserManagement | null> {
    const result = await UserModel.findByIdAndUpdate(userId,{$set:{status:status}},{new:true})
    return result as UserManagement|null
  }
}
