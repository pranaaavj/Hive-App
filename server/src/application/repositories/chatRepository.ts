import { RedisClient } from "../../infrastructure/cache/redis";
import { ChatModel, IChat } from "../../infrastructure/model/ChatModel";

export interface ChatRepository {
    findChatByUsers(userId1: string, userId2: string) : Promise<IChat | null>
    createChat(members: string[]) : Promise<IChat>
    findChatsByUserId(userId: string) : Promise<IChat[]>
}

export class MongoChatRepository  implements ChatRepository {
    private redis: RedisClient;
    
      constructor() {
        this.redis = new RedisClient();
      }
    async findChatByUsers(userId1: string, userId2: string): Promise<IChat> {
        const chat = await ChatModel.findOne({members: {$all: [userId1, userId2], $size: 2}})
        return chat as IChat
    }
    async createChat(members: string[]): Promise<IChat> {
        return await ChatModel.create({
            members
        })
    }
    async findChatsByUserId(userId: string): Promise<IChat[]> {
        return await ChatModel.find({members: userId}).sort({updatedAt: -1})
    }
}