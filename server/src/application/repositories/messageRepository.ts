import { Types } from 'mongoose';
import { RedisClient } from '../../infrastructure/cache/redis';
import { IFormattedMessage, IMessage, MessageModel, PaginatedMessages } from '../../infrastructure/model/messageModel';

export interface MessageRepository {
  createMessage(chatId: string, senderId: string, text: string): Promise<IMessage>;
  findLastMessage(chatId: string): Promise<IMessage | null>;
  findMessagesByChatId(chatId: string, page: number, limit: number): Promise<PaginatedMessages>;
}

export class MongoMessageRepository implements MessageRepository {
  private redis: RedisClient;

  constructor() {
    this.redis = new RedisClient();
  }
  async createMessage(chatId: string, senderId: string, text: string): Promise<IMessage> {
    return await MessageModel.create({
      chatId,
      sender: senderId,
      text,
    });
  }
  async findLastMessage(chatId: string): Promise<IMessage | null> {
    return await MessageModel.findOne({ chatId }).sort({ createdAt: -1 });
  }
  async findMessagesByChatId(
    chatId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedMessages> {
    const skip = page * limit;

    const rawMessages  = await MessageModel.find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

      const messages:IFormattedMessage[] = rawMessages.map((msg)=>({
        messageId:msg._id.toString(),
        text:msg.text,
        isSeen:msg.isSeen,
        createdAt: msg.createdAt!, 
      }))

    const totalCount = await MessageModel.countDocuments({ chatId });

    return {
      messages,
      page,
      limit,
      hasMore: skip + limit < totalCount,
    };
  }
}
