import { Types } from "mongoose";
import { IComment, Comment } from "../../domain/entities/commentEntity";
import { ICommentModel, CommentModel } from "../../infrastructure/model/commentModel";
import { RedisClient } from "../../infrastructure/cache/redis";

export interface CommentRepository {
    save(comment: Comment): Promise<ICommentModel>;
    findByPostId(postId: string, page: number, limit: number): Promise<ICommentModel[]>;
    findReplies(parentCommentId: string, page: number, limit: number): Promise<ICommentModel[]>;
    findById(id: string): Promise<ICommentModel | null>;
    delete(id: string): Promise<ICommentModel | null>;
}

export class MongoCommentRepository implements CommentRepository {
  private redis: RedisClient;

  constructor() {
    this.redis = new RedisClient();
  }

  async save(comment: Comment): Promise<ICommentModel> {
    const commentData = {
      postId: new Types.ObjectId(comment.postId),
      userId: new Types.ObjectId(comment.userId),
      content: comment.content,
      parentCommentId: comment.parentCommentId ? new Types.ObjectId(comment.parentCommentId) : undefined,
      likeCount: comment.likeCount,
      depth: comment.depth,
      isDeleted: comment.isDeleted,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
    const savedComment = await CommentModel.create(commentData);
    if (this.redis.client) {
      await this.redis.client.del(`comments:${comment.postId}:page:*`);
    }
    return savedComment;
  }

  async findByPostId(postId: string, page: number, limit: number): Promise<ICommentModel[]> {
    const cacheKey = `comments:${postId}:page:${page}:limit:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const comments = await CommentModel.find({
      postId: new Types.ObjectId(postId),
      parentCommentId: null,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .populate('userId', 'username profilePicture');

    if (this.redis.client) {
      await this.redis.setEx(cacheKey, JSON.stringify(comments), 60);
    }
    return comments;
  }

  async findReplies(parentCommentId: string, page: number, limit: number): Promise<ICommentModel[]> {
    const cacheKey = `replies:${parentCommentId}:page:${page}:limit:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const replies = await CommentModel.find({
      parentCommentId: new Types.ObjectId(parentCommentId),
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .populate('userId', 'username profilePicture');

    if (this.redis.client) {
      await this.redis.setEx(cacheKey, JSON.stringify(replies), 60);
    }
    return replies;
  }

  async findById(id: string): Promise<ICommentModel | null> {
    return await CommentModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false }).populate(
      'userId',
      'username profilePicture'
    );
  }

  async delete(id: string): Promise<ICommentModel | null> {
    const comment = await CommentModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { content: '[Deleted]', isDeleted: true },
      { new: true }
    );
    if (comment && this.redis.client) {
      await this.redis.client.del(`comments:${comment.postId}:page:*`);
    }
    return comment;
  }
}