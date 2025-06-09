import { Types } from 'mongoose';
import { RedisClient } from '../../infrastructure/cache/redis';
import { IStory, IStoryDocument, StoryModel } from '../../infrastructure/model/StoryModel';
import { UserModel } from '../../infrastructure/model/user.model';
import { ApiError } from '../../utils/apiError';

export interface StoryRepository {
  addStory(
    userId: Types.ObjectId,
    mediaUrl: string,
    mediaType: string,
    createdAt: Date,
    expiresAt: Date,
  ): Promise<IStory | null>;
  getStories(userId: string): Promise<any | null>;
  findById(storyId: string): Promise<IStoryDocument | null>;
  getMyStories(userId: string): Promise<any | null>;
}

export class MongoStoryRespository implements StoryRepository {
  private redis: RedisClient;

  constructor() {
    this.redis = new RedisClient();
  }

  async addStory(
    userId: Types.ObjectId,
    mediaUrl: string,
    mediaType: string,
    createdAt: Date,
    expiresAt: Date,
  ): Promise<IStory | null> {
    try {
      const newStory = new StoryModel({
        userId,
        mediaUrl,
        mediaType,
        createdAt,
        expiresAt,
        viewers: [],
      });

      await newStory.save();

      return newStory as IStory | null;
    } catch (error) {
      return null;
    }
  }
  async getStories(userId: string): Promise<any | null> {
    const user = await UserModel.findById(userId).select('following');

    const followingUserIds = user?.following || [];
    const stories = await StoryModel.aggregate([
      {
        $match: {
          userId: { $in: followingUserIds },
          expiresAt: { $gt: new Date() },
        },
      },
      {
        $addFields: {
          isSeen: { $in: [{ $toObjectId: userId }, '$viewers'] },
        },
      },
      {
        $group: {
          _id: '$userId',
          stories: {
            $push: {
              _id: '$_id',
              mediaUrl: '$mediaUrl',
              mediaType: '$mediaType',
              createdAt: '$createdAt',
              isSeen: '$isSeen',
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 0,
          userId: '$user._id',
          username: '$user.username',
          profilePicture: '$user.profilePicture',
          stories: 1,
        },
      },
    ]);
    return stories;
  }
  async findById(storyId: string): Promise<IStoryDocument | null> {
    const story = await StoryModel.findById(storyId);
    return story as IStoryDocument;
  }
  async getMyStories(userId: string): Promise<any | null> {
    const user = await UserModel.findById(userId).select("username profilePicture");
  
    if (!user) {
      throw new ApiError  ("User not found", 404);
    }
  
    const stories = await StoryModel.find({
      userId: user._id,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: 1 });
  
    if (!stories.length) {
      return {
        userId: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
        stories: []
      };
    }
  
    const formattedStories = stories.map((story) => ({
      _id: story._id,
      mediaUrl: story.mediaUrl,
      mediaType: story.mediaType,
      createdAt: story.createdAt,
      isSeen: story.viewers.includes(new Types.ObjectId(userId)),
    }));
  
    return {
      userId: user._id,
      username: user.username,
      profilePicture: user.profilePicture,
      stories: formattedStories,
    };
  }
  
}
