// src/domain/entities/commentEntity.ts
import { Types } from 'mongoose';

export interface IComment {
  id?: string;
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  likeCount: number;
  depth: number;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Comment {
  constructor(
    public id: string,
    public postId: string,
    public userId: string,
    public content: string,
    public parentCommentId: string | undefined,
    public likeCount: number,
    public depth: number,
    public isDeleted: boolean,
    public createdAt: Date,
    public updatedAt: Date
  ) {
    if (!content || content.length > 500) {
      throw new Error('Invalid comment content');
    }
  }

  static create(data: Partial<IComment>): Comment {
    return new Comment(
      data.id || new Types.ObjectId().toString(),
      data.postId!,
      data.userId!,
      data.content!,
      data.parentCommentId,
      data.likeCount || 0,
      data.depth || 0,
      data.isDeleted || false,
      data.createdAt || new Date(),
      data.updatedAt || new Date()
    );
  }
}