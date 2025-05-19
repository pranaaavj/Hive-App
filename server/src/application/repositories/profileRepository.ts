import { Types } from 'mongoose';
import { ProfileSummary, User } from '../../domain/entities/user.entity';
import { UserModel } from '../../infrastructure/model/user.model';
import { RedisClient } from '../../infrastructure/cache/redis';

export interface ProfileRepository {
  updateProfileImage(userId: string, imageUrl: string): Promise<User | null>;
  findById(userId: string): Promise<ProfileSummary | null>;
  // followUser(currentUserId: string, targetUserId: string): Promise<void>;
  // unfollowUser(currentUserId: string, targetUserId: string): Promise<void>;
  // getFollowers(userId: string): Promise<string[]>;
  // getFollowing(userId: string): Promise<string[]>;
}

export class MongoProfileRepository implements ProfileRepository {
  private redis: RedisClient;

  constructor() {
    this.redis = new RedisClient();
  }

  async updateProfileImage(userId: string, imageUrl: string): Promise<User | null> {
    console.log(imageUrl);
    const updatedUser = await UserModel.findByIdAndUpdate(
      new Types.ObjectId(userId),
      { profilePicture: imageUrl },
      { new: true },
    ).lean();

    if (updatedUser && this.redis.client) {
      await this.redis.setEx(`user:${userId}`, JSON.stringify(updatedUser), 60);
    }

    return updatedUser as User | null;
  }
  async findById(userId: string): Promise<ProfileSummary | null> {
    const cacheKey = `user:summary:${userId}`;
    const cached = await this.redis.get(cacheKey);
  
    if (cached) {
      return JSON.parse(cached) as ProfileSummary;
    }
  
    const result = await UserModel.aggregate([
      { $match: { _id: new Types.ObjectId(userId) } },
      {
        $project: {
          _id: 1,
          username: 1,
          email: 1,
          role: 1,
          isVerified: 1,
          isDeleted: 1,
          profilePicture: 1,
          bio: 1,
          postsCount: 1,
          createdAt: 1,
          updatedAt: 1,
          followersCount: { $size: '$followers' },
          followingCount: { $size: '$following' },
        },
      },
    ]);
  
    const user = result[0];
  
    if (user && this.redis.client) {
      await this.redis.setEx(cacheKey, JSON.stringify(user), 60);
    }
  
    return user as ProfileSummary | null;
  }
}
