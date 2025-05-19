import { IPostModel, PostModel } from '../../infrastructure/model/postModel';
import { IPost, Post } from '../../domain/entities/postEntity';
import { Types } from 'mongoose';
import { RedisClient } from '../../infrastructure/cache/redis';

export interface PostRepository {
  save(post: Post): Promise<IPostModel>;
  findAll(userId: string): Promise<IPostModel[]>;
  findById(id: string): Promise<IPostModel | null>;
  delete(id: string): Promise<IPostModel | null>;
  likePost(postId: string, userId: string): Promise<IPostModel | null>;
  unlikePost(postId: string, userId: string): Promise<IPostModel | null>;
  findByUserId(userId: string, page: number, limit: number): Promise<IPostModel[]>;
  updateCommentCount(postId: string, increment: number): Promise<void>;
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
    return savedPost;
  }

  async findAll(userId: string): Promise<IPostModel[]> {
    const cacheKey = `posts:user:${userId}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const posts = await PostModel.find({ isDeleted: false, status: 'active' })
      .sort({ createdAt: -1 })
      // .populate('userId', 'username profilePicture');
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

    const post = await PostModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false }).populate(
      'userId',
      'username profilePicture'
    );

    if (post && this.redis.client) {
      await this.redis.setEx(cacheKey, JSON.stringify(post), 60);
    }
    return post;
  }

  async delete(id: string): Promise<IPostModel | null> {
    const post = await PostModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { isDeleted: true, status: 'deleted' },
      { new: true }
    );
    if (post && this.redis.client) {
      await this.redis.client.del(`post:${id}`);
      await this.redis.client.del(`posts:page:*`);
    }
    return post;
  }

  async likePost(postId: string, userId: string): Promise<IPostModel | null> {
    const post = await PostModel.findOneAndUpdate(
      { _id: new Types.ObjectId(postId), isDeleted: false, likes: { $ne: new Types.ObjectId(userId) } },
      { $addToSet: { likes: new Types.ObjectId(userId) }, $inc: { likeCount: 1 } },
      { new: true }
    ).populate('userId', 'username profilePicture');
    if (post && this.redis.client) {
      await this.redis.setEx(`post:${postId}`, JSON.stringify(post), 60);
    }
    return post;
  }

  async unlikePost(postId: string, userId: string): Promise<IPostModel | null> {
    const post = await PostModel.findOneAndUpdate(
      { _id: new Types.ObjectId(postId), isDeleted: false, likes: new Types.ObjectId(userId) },
      { $pull: { likes: new Types.ObjectId(userId) }, $inc: { likeCount: -1 } },
      { new: true }
    ).populate('userId', 'username profilePicture');
    if (post && this.redis.client) {
      await this.redis.setEx(`post:${postId}`, JSON.stringify(post), 60);
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
      { new: true }
    );
    if (post && this.redis.client) {
      await this.redis.setEx(`post:${postId}`, JSON.stringify(post), 60);
    }
  }
}