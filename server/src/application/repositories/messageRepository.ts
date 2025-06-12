import { Types } from "mongoose";
import { RedisClient } from "../../infrastructure/cache/redis";
import { IMessage, MessageModel } from "../../infrastructure/model/messageModel";

export interface MessageRepository {
    createMessage(chatId: string, senderId: string, text: string) : Promise<IMessage>
    findLastMessage(chatId: string) : Promise<IMessage | null>
}


export class MongoMessageRepository implements MessageRepository {
    
private redis: RedisClient;
    
      constructor() {
        this.redis = new RedisClient();
      }
    async createMessage(chatId: string, senderId: string,text:string): Promise<IMessage> {
        return await MessageModel.create({
            chatId,
            sender: senderId,
            text,
        })
    }
    async findLastMessage(chatId: string): Promise<IMessage | null> {
        return await MessageModel.findOne({chatId}).sort({createdAt: -1})
    }
}