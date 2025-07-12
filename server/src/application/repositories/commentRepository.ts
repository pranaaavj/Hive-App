import { Types } from 'mongoose';
import { IComment, Comment } from '../../domain/entities/commentEntity';
import { ICommentModel, CommentModel } from '../../infrastructure/model/commentModel';
import { RedisClient } from '../../infrastructure/cache/redis';

export interface CommentRepository {
  save(comment: Comment): Promise<ICommentModel>;
  findByPostId(postId: string, page: number, limit: number): Promise<ICommentModel[]>;
  findReplies(parentCommentId: string, page: number, limit: number): Promise<ICommentModel[]>;
  findById(id: string): Promise<ICommentModel | null>;
  delete(id: string): Promise<ICommentModel | null>;
  hasReplies(commentId: string): Promise<boolean>;
  softDelete(id: string, deletedBy: string): Promise<ICommentModel | null>;
  hardDelete(id: string): Promise<ICommentModel | null>;
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
      parentCommentId: comment.parentCommentId
        ? new Types.ObjectId(comment.parentCommentId)
        : undefined,
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

  async findByPostId(
    postId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ICommentModel[]> {
    const cacheKey = `comments:${postId}:page:${page}:limit:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const comments = await CommentModel.find({
      postId: new Types.ObjectId(postId),
      parentCommentId: null,
    })
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .populate('userId', '_id username profilePicture');

    if (this.redis.client) {
      await this.redis.setEx(cacheKey, JSON.stringify(comments), 2);
    }
    return comments;
  }

  async findReplies(
    parentCommentId: string,
    page: number,
    limit: number,
  ): Promise<ICommentModel[]> {
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
      .populate('userId', 'username profilePicture')
      .lean();
    if (this.redis.client) {
      await this.redis.setEx(cacheKey, JSON.stringify(replies), 2);
    }
    return replies;
  }

  async findById(id: string): Promise<ICommentModel | null> {
    return await CommentModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false }).populate(
      'userId',
      'username profilePicture',
    );
  }

  async delete(id: string): Promise<ICommentModel | null> {
    return await this.softDelete(id, 'system');
  }

  async hasReplies(commendId: string): Promise<boolean> {
    const count = await CommentModel.countDocuments({
      parentCommentId: new Types.ObjectId(commendId),
      isDeleted: false,
    });
    return count > 0;
  }

  async softDelete(id: string, deletedBy: string): Promise<ICommentModel | null> {
    const comment = await CommentModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      {
        content: '[Comment deleted]',
        isDeleted: true,
        deletedBy: new Types.ObjectId(deletedBy),
        deletedAt: new Date(),
      },
      { new: true },
    ).populate('userId', 'username profilePicture');

    if (comment && this.redis.client) {
      await this.redis.client.del(`comments:${comment.postId}:page:*`);
    }
    return comment;
  }

  async hardDelete(id: string): Promise<ICommentModel | null> {
    const comment = await CommentModel.findByIdAndDelete(new Types.ObjectId(id));
    if (comment && this.redis.client) {
      await this.redis.client.del(`comments:${comment.postId}:page:*`);
    }
    return comment;
  }
}
