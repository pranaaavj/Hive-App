// src/infrastructure/model/commentModel.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface ICommentModel extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  parentCommentId?: Types.ObjectId;
  likeCount: number;
  depth: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<ICommentModel>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
    likeCount: { type: Number, default: 0 },
    depth: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1 });
commentSchema.index({ userId: 1 });

export const CommentModel = model<ICommentModel>('Comment', commentSchema);