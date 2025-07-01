import { Types } from 'mongoose';
import { UserModel } from '../../infrastructure/model/user.model';
import { PostModel } from '../../infrastructure/model/postModel';
import { IPostModel } from '../../infrastructure/model/postModel';

export interface UserManagement {
  _id: Types.ObjectId;
  isVerified: boolean;
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
  suspendUser(userId: string, status: boolean): Promise<UserManagement | null>;
  userCountAndSuspendCount(): Promise<{ userCount: number; suspendedUser: number }>;
  getAllPosts(): Promise<IPostModel[] | null>;
  deletePost(postId: string): Promise<IPostModel | null>;
  postCount(): Promise<{ totalPosts: number }>;
  searchUser(query: string): Promise<UserManagement[]>;
}

export class MongoAdminUserManagementRepository implements AdminUserManagementRepository {
  async getAllUsers(): Promise<UserManagement[] | null> {
    const allUsers = await UserModel.find()
      .select('_id username email profilePicture status postsCount followers createdAt')
      .lean();

    console.log(this.getAllUsers, 'from the user management repo');
    return allUsers.map((user) => ({
      _id: user._id as Types.ObjectId,
      username: user.username,
      isVerified: user.isVerified,
      email: user.email,
      profilePicture: user.profilePicture ?? '',
      status: user.status,
      postsCount: user.postsCount,
      followers: user.followers.length,
      createdAt: user.createdAt,
    }));
  }

  async suspendUser(userId: string, status: boolean): Promise<UserManagement | null> {
    const result = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { status: status } },
      { new: true },
    );
    return result as UserManagement | null;
  }
  async userCountAndSuspendCount(): Promise<{ userCount: number; suspendedUser: number }> {
    const userCount = await UserModel.countDocuments({ isVerified: true });
    const suspendedUser = await UserModel.countDocuments({ status: false });
    return { userCount, suspendedUser };
  }
  async getAllPosts(): Promise<IPostModel[] | null> {
    const posts = await PostModel.find().populate('userId', '_id username profilePicture');
    return posts;
  }

  async deletePost(postId: string): Promise<IPostModel | null> {
    return await PostModel.findByIdAndDelete({ _id: postId });
  }

  async postCount(): Promise<{ totalPosts: number }> {
    const totalPosts = await PostModel.countDocuments({ isDeleted: false });
    return { totalPosts };
  }

  async searchUser(query: string): Promise<UserManagement[]> {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escaped}`, 'i');

    const raw = await UserModel.find({
      $or: [{ username: regex }, { email: regex }],
      isDeleted: false,
    })
      .select('_id username email profilePicture isVerified status postsCount followers createdAt')
      .limit(20)
      .lean()
      .exec();

    return raw.map((doc) => ({
      _id: doc._id as Types.ObjectId,
      username: doc.username,
      email: doc.email,
      profilePicture: doc.profilePicture,
      isVerified: doc.isVerified,
      status: doc.status,
      postsCount: doc.postsCount,
      followers: Array.isArray(doc.followers) ? doc.followers.length : 0,
      createdAt: doc.createdAt,
    }));
  }
}
