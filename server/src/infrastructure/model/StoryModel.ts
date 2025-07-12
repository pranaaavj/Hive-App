import { model, Model, Schema, Types, Document } from 'mongoose';

// Plain data interface (no Mongoose methods)
export interface IStory {
  userId: Types.ObjectId;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: Date;
  expiresAt: Date;
  viewers: Types.ObjectId[];
}

// Mongoose Document interface for full type support (includes .save(), .populate(), etc.)
export interface IStoryDocument extends IStory, Document {}

const storySchema: Schema<IStoryDocument> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    viewers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true },
);

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const StoryModel: Model<IStoryDocument> = model<IStoryDocument>('Story', storySchema);
