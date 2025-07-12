// src/infrastructure/model/commentModel.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface ICommentModel extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  parentCommentId?: Types.ObjectId;
  depth: number;
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
}

const commentSchema = new Schema<ICommentModel>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
    depth: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1 });
commentSchema.index({ userId: 1 });

export const CommentModel = model<ICommentModel>('Comment', commentSchema);
