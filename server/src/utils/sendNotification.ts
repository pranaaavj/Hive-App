import { Types } from "mongoose";
import {  NotificationModel } from "../infrastructure/model/notification";
import { getIO, onlineUsers } from "../infrastructure/websocket/socket";
import { MongoNotificationRepository } from "../application/repositories/notificationRepository";
import { MongoProfileRepository } from "../application/repositories/profileRepository";
export type CreateNotificationInput = {
    userId: Types.ObjectId;
    fromUser: Types.ObjectId;
    type: "comment" | "like" | "follow";
    postId?: Types.ObjectId;
    message: string;
    postImage?: string,
  };
export async function  createAndEmitNotification({
    userId,
    fromUser,
    type,
    postId,
    message,
    postImage,
}: CreateNotificationInput) {

    const io = getIO()
    const newMongo = new MongoNotificationRepository()
    const notification = await newMongo.createNotification({userId, fromUser, type, postId, message,postImage})

    const receiverSocketId = onlineUsers.get(userId.toString())
    if(type == "follow") {
        const mongoProfileRep = new MongoProfileRepository()
        const followed = await mongoProfileRep.getMutualFollowStatus(userId.toString(), fromUser._id.toString())
        if(receiverSocketId) {
            const enrichedNotification = {
                ...notification.toObject(),
                ...followed
              };
              io.to(receiverSocketId).emit("notification", enrichedNotification);
              return
        }
    }
    if(receiverSocketId) {
        io.to(receiverSocketId).emit("notification", notification)
    }
}