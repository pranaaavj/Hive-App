import { Types } from 'mongoose';

export interface IUser {
  id?: string;
  username: string;
  email: string;
  password: string;
  role: string;
  isVerified: boolean;
  resetPasswordToken?: string;
  isDeleted: boolean;
  isOnline: boolean,
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProfileSummary {
  _id: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  isDeleted: boolean;
  profilePicture: string;
  bio: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  constructor(
    public _id: string,
    public username: string,
    public email: string,
    public password: string,
    public role: string,
    public isVerified: boolean,
    public resetPasswordToken: string | undefined,
    public isDeleted: boolean,
    public createdAt: Date,
    public updatedAt: Date
  ) {
    if (!username || !email || !password) {
      throw new Error('Username, email, and password are required');
    }
  }

  static create(data: Partial<IUser>): User {
    return new User(
      data.id || new Types.ObjectId().toString(),
      data.username!,
      data.email!,
      data.password!,
      data.role || 'user',
      data.isVerified || false,
      data.resetPasswordToken,
      data.isDeleted || false,
      data.createdAt || new Date(),
      data.updatedAt || new Date()
    );
  }
}
