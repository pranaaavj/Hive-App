import { Types } from 'mongoose';
import { ProfileSummary, User } from '../../domain/entities/user.entity';
import { UserModel } from '../../infrastructure/model/user.model';
import { RedisClient } from '../../infrastructure/cache/redis';
import { SearchUsers } from '../../domain/entities/profileEntity';

export interface ProfileRepository {
  updateProfileImage(userId: string, imageUrl: string): Promise<User | null>;
  findById(userId: string, reqUser: string): Promise<ProfileSummary | null>;
  followUser(userId: string, followingUserId: string): Promise<ProfileSummary | null>;
  searchUsersByUsername(query: string): Promise<SearchUsers | null>;
  unfollowUser(userId: string, unfollowUserId: string): Promise<ProfileSummary | null>;
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
  async findById(userId: string, reqUser: string): Promise<ProfileSummary | null> {
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

    if (userId != reqUser) {
      const [reqUserDoc, targetUserDoc] = await Promise.all([
        UserModel.findById(reqUser, { following: 1 }),
        UserModel.findById(userId, { following: 1 }),
      ]);

      const isFollowing = reqUserDoc?.following?.includes(new Types.ObjectId(userId));
      const isFollowed = targetUserDoc?.following?.includes(new Types.ObjectId(reqUser));

      return {
        ...user,
        isFollowing: !!isFollowing,
        isFollowed: !!isFollowed,
      } as ProfileSummary & {
        isFollowing: boolean;
        isFollowed: boolean;
      };
    }

    // if (user && this.redis.client) {
    //   await this.redis.setEx(cacheKey, JSON.stringify(user), 60);
    // }

    return user as ProfileSummary | null;
  }
  // if (user && this.redis.client) {
  //   await this.redis.setEx(cacheKey, JSON.stringify(user), 60);
  // }
  async followUser(userId: string, followingUserId: string): Promise<ProfileSummary | null> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { following: new Types.ObjectId(followingUserId) } },
      { new: true },
    );
    await UserModel.findByIdAndUpdate(
      followingUserId,
      { $addToSet: { followers: new Types.ObjectId(userId) } },
      { new: true },
    );

    return user as ProfileSummary | null;
  }

  async unfollowUser(userId: string, unfollowUserId: string): Promise<ProfileSummary | null> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { following: new Types.ObjectId(unfollowUserId) } },
      { new: true },
    );

    await UserModel.findByIdAndUpdate(
      unfollowUserId,
      { $pull: { followers: new Types.ObjectId(userId) } },
      { new: true },
    );

    return user as ProfileSummary | null
  }

  async searchUsersByUsername(query: string): Promise<SearchUsers | null> {
    const users = await UserModel.find({
      isVerified: true,
      username: { $regex: query, $options: 'i' },
    }).select('username profilePicture followers');

    return users.map((user) => ({
      _id: (user._id as Types.ObjectId).toString(),
      username: user.username,
      profilePicture: user.profilePicture,
      followers: user.followers.length,
    })) as SearchUsers | null;
  }
}
