import { INotification, NotificationModel } from '../../infrastructure/model/notification';
import { UserModel } from '../../infrastructure/model/user.model';
import { CreateNotificationInput } from '../../utils/sendNotification';

export interface NotificationRepository {
  createNotification(notificationData: CreateNotificationInput): Promise<void>;
  getNotifications(userId: string): Promise<INotification[]>;
}

export class MongoNotificationRepository implements NotificationRepository {
  async createNotification(notificationData: CreateNotificationInput): Promise<any> {
    const notification = await NotificationModel.create(notificationData);
    return notification.populate("fromUser", "_id username profilePicture")
  }
  async getNotifications(userId: string): Promise<any[]> {
    // 1. Get all notifications
    const notifications = await NotificationModel.find({ userId })
      .populate('fromUser', 'username profilePicture following')
      .sort({ createdAt: -1 })
      .lean();
  
    // 2. Get the current user's following list
    const currentUser = await UserModel.findById(userId, 'following');
    if (!currentUser) return [];
  
    const followingIds = currentUser.following.map(id => id.toString());

    const enhanced = await Promise.all(
      notifications.map(async (notif) => {
        if (notif.type !== 'follow') return notif;
  
        const fromUserId = notif.fromUser._id.toString();
  
        // Check if current user follows fromUser
        const isFollowing = followingIds.includes(fromUserId);
  
        // Check if fromUser follows current user
        const fromUserDoc = await UserModel.findById(fromUserId, 'following');
        const isFollowed = fromUserDoc?.following.some(id => id.equals(userId)) ?? false;
  
        return {
          ...notif,
          isFollowing,
          isFollowed
        };
      })
    );
  
    return enhanced;
  }
  
}
