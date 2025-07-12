import { IPostModel, PostModel } from '../../infrastructure/model/postModel';
import { IPost, Post } from '../../domain/entities/postEntity';
import { Types } from 'mongoose';
import { RedisClient } from '../../infrastructure/cache/redis';
import { UserModel } from '../../infrastructure/model/user.model';
import { getIO } from '../../infrastructure/websocket/socket';

export interface PostRepository {
  save(post: Post): Promise<IPostModel>;
  findAll(userId: string): Promise<IPostModel[]>;
  findById(id: string): Promise<IPostModel | null>;
  delete(id: string): Promise<IPostModel | null>;
  likePost(postId: string, userId: string): Promise<IPostModel | null>;
  unlikePost(postId: string, userId: string): Promise<IPostModel | null>;
  findByUserId(userId: string, page: number, limit: number): Promise<IPostModel[]>;
  updateCommentCount(postId: string, increment: number): Promise<void>;
  findUserPost(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ posts: IPostModel[]; hasMore: boolean }>;
  getUserByPost(postId: string): Promise<IPostModel | null>;
}

export class MongoPostRepository implements PostRepository {
  private redis: RedisClient;

  constructor() {
    this.redis = new RedisClient();
  }

  async save(post: Post): Promise<IPostModel> {
    const postData = {
      userId: new Types.ObjectId(post.userId),
      caption: post.caption,
      imageUrls: post.imageUrls,
      likes: post.likes.map((id) => new Types.ObjectId(id)),
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      status: post.status,
      isDeleted: post.isDeleted,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };

    const savedPost = await PostModel.create(postData);
    if (this.redis.client) {
      await this.redis.client.del(`posts:page:*`);
    }
    const fullPost = await PostModel.findById(savedPost._id).populate(
      'userId',
      'username profilePicture',
    );

    if (fullPost) {
      const io = getIO();
      io.emit('newPost', {
        postId: fullPost._id.toString(),
        user: fullPost.userId,
        caption: fullPost.caption,
        imageUrls: fullPost.imageUrls,
        createdAt: fullPost.createdAt,
      });
    }
    return savedPost;
  }

  async findAll(userId: string): Promise<IPostModel[]> {
    const cacheKey = `posts:user:${userId}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const posts = await PostModel.find({ userId, isDeleted: false, status: 'active' })

      .sort({ createdAt: -1 })
      .populate('userId', 'username profilePicture');
    if (this.redis.client) {
      await this.redis.setEx(cacheKey, JSON.stringify(posts), 60);
    }
    return posts;
  }

  async findById(id: string): Promise<IPostModel | null> {
    const cacheKey = `post:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const post = await PostModel.findOne({
      _id: new Types.ObjectId(id),
      isDeleted: false,
    }).populate('userId', 'username profilePicture');

    if (post && this.redis.client) {
      await this.redis.setEx(cacheKey, JSON.stringify(post), 60);
    }
    return post;
  }

  async delete(id: string): Promise<IPostModel | null> {
    const post = await PostModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { isDeleted: true, status: 'deleted' },
      { new: true },
    );
    if (post && this.redis.client) {
      await this.redis.client.del(`post:${id}`);
      await this.redis.client.del(`posts:page:*`);
    }
    return post;
  }

  async likePost(postId: string, userId: string): Promise<IPostModel | null> {
    if (this.redis.client) {
      await this.redis.client.del(`post:${postId}`);
    }
    const post = await PostModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(postId),
        isDeleted: false,
        likes: { $ne: new Types.ObjectId(userId) },
      },
      { $addToSet: { likes: new Types.ObjectId(userId) }, $inc: { likeCount: 1 } },
      { new: true },
    ).populate('userId', 'username profilePicture');
    if (post && this.redis.client) {
      await this.redis.setEx(`post:${postId}`, JSON.stringify(post), 60);
    }

    if (post) {
      const io = getIO();
      io.to(post._id.toString()).emit('postLiked', {
        postId: post._id.toString(),
        likeCount: post.likeCount,
      });
    }
    return post;
  }

  async unlikePost(postId: string, userId: string): Promise<IPostModel | null> {
    if (this.redis.client) {
      await this.redis.client.del(`post:${postId}`);
    }
    const post = await PostModel.findOneAndUpdate(
      { _id: new Types.ObjectId(postId), isDeleted: false, likes: new Types.ObjectId(userId) },
      { $pull: { likes: new Types.ObjectId(userId) }, $inc: { likeCount: -1 } },
      { new: true },
    ).populate('userId', 'username profilePicture');
    if (post && this.redis.client) {
      await this.redis.setEx(`post:${postId}`, JSON.stringify(post), 60);
    }
    if (post) {
      const io = getIO();
      io.to(post._id.toString()).emit('postUnliked', {
        postId: post._id.toString(),
        likeCount: post.likeCount,
      });
    }
    return post;
  }

  async findByUserId(userId: string, page: number, limit: number): Promise<IPostModel[]> {
    const cacheKey = `posts:user:${userId}:page:${page}:limit:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const posts = await PostModel.find({
      userId: new Types.ObjectId(userId),
      isDeleted: false,
      status: 'active',
    })
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .populate('userId', 'username profilePicture');

    if (this.redis.client) {
      await this.redis.setEx(cacheKey, JSON.stringify(posts), 60);
    }
    return posts;
  }

  async updateCommentCount(postId: string, increment: number): Promise<void> {
    const post = await PostModel.findByIdAndUpdate(
      new Types.ObjectId(postId),
      { $inc: { commentCount: increment } },
      { new: true },
    );
    if (post && this.redis.client) {
      await this.redis.setEx(`post:${postId}`, JSON.stringify(post), 60);
    }
  }

  async findUserPost(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ posts: IPostModel[]; hasMore: boolean }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }
    const cacheKey = `post:user:${userId}:page:${page}:limit:${limit}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    try {
      const user = await UserModel.findById(userId, { following: 1 }).lean<{
        following: Types.ObjectId[];
      }>();
      if (!user) {
        return { posts: [], hasMore: false };
      }
      const followingIds = [
        ...user.following.map((id) => new Types.ObjectId(id)),
        new Types.ObjectId(userId),
      ];
      console.log(followingIds, 'followingIds');

      const posts = await PostModel.aggregate([
        {
          $match: {
            userId: { $in: followingIds },
            isDeleted: false,
            status: 'active',
          },
        },
        { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        {
          $project: {
            userId: 1,
            caption: 1,
            imageUrls: 1,
            likeCount: 1,
            likes: 1,
            commentCount: 1,
            createdAt: 1,
            'user.username': 1,
            'user.profilePicture': 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit + 1 },
      ]);

      const hasMore = posts.length > limit;
      const trimmedPosts = hasMore ? posts.slice(0, limit) : posts;
      if (trimmedPosts.length > 0) {
        await this.redis.setEx(cacheKey, JSON.stringify({ posts: trimmedPosts, hasMore }), 1);
      }

      return { posts: trimmedPosts, hasMore };
    } catch (error) {
      console.warn('Error in findUserPost:', error);
      return { posts: [], hasMore: false };
    }
  }
  async getUserByPost(postId: string): Promise<IPostModel | null> {
    return await PostModel.findOne({ _id: postId }).select({
      _id: false,
      userId: true,
      imageUrls: true,
    });
  }
}
