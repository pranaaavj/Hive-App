import { IChat } from "../../infrastructure/model/ChatModel";
import {IMessage } from "../../infrastructure/model/messageModel";
import { IUser } from "./user.entity";

export interface AddChat {
    chat: IChat,
    message: IMessage
}

export interface Userchats {
    _id: string;
    otherUser: Partial<IUser> | null;
    lastMessage: IMessage | null;
    updatedAt: Date;
  }
  