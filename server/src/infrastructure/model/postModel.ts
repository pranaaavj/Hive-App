// src/infrastructure/model/postModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPostModel extends Document {
  _id:mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  imageUrls: string[];
  likes: mongoose.Types.ObjectId[];
  likeCount: number;
  caption?: string;
  commentCount: number;
  status: 'active' | 'deleted';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPostModel>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    caption: { type: String },
    imageUrls: [{ type: String, required: true }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'deleted'], default: 'active' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

export const PostModel = mongoose.model<IPostModel>('PostModel', postSchema);