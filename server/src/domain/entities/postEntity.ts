// src/domain/entities/postEntity.ts
import { Types } from 'mongoose';

export interface IPost {
  id?: string;
  userId: string;
  caption?: string;
  imageUrls: string[];
  likes: string[];
  likeCount: number;
  commentCount: number;
  status: 'active' | 'deleted';
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Post {
  constructor(
    public id: string,
    public userId: string,
    public caption: string | undefined,
    public imageUrls: string[],
    public likes: string[],
    public likeCount: number,
    public commentCount: number,
    public status: 'active' | 'deleted',
    public isDeleted: boolean,
    public createdAt: Date,
    public updatedAt: Date,
  ) {
    if (!imageUrls || imageUrls.length === 0) {
      throw new Error('Post must have at least one image');
    }
  }

  static create(data: Partial<IPost>): Post {
    return new Post(
      data.id || new Types.ObjectId().toString(),
      data.userId!,
      data.caption,
      data.imageUrls || [],
      data.likes || [],
      data.likeCount || 0,
      data.commentCount || 0,
      data.status || 'active',
      data.isDeleted || false,
      data.createdAt || new Date(),
      data.updatedAt || new Date(),
    );
  }
}
