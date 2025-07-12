import { model, Schema, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  fromUser: Types.ObjectId;
  type: 'comment' | 'like' | 'follow';
  postId?: Types.ObjectId;
  message: string;
  postImage?: string;
  isRead: boolean;
}
const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fromUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow'],
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    message: {
      type: String,
      required: true,
    },
    postImage: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const NotificationModel = model<INotification>('Notification', notificationSchema);
