import { Types } from 'mongoose';
import { AddChat, Userchats } from '../../domain/entities/chatEntity';
import { ApiError } from '../../utils/apiError';
import { ChatRepository } from '../repositories/chatRepository';
import { MessageRepository } from '../repositories/messageRepository';
import { IChat } from '../../infrastructure/model/ChatModel';
import { UserRepository } from '../repositories/user.repository';
import { IPopulatedMessage, MessageModel, PaginatedMessages } from '../../infrastructure/model/messageModel';

export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private messageRepository: MessageRepository,
    private userRepository: UserRepository
    
  ) {}

  async sendMessage(senderId: string, receiverid: string, text: string, type: string): Promise<AddChat> {
    let chat = await this.chatRepository.findChatByUsers(senderId, receiverid);

    if (!chat) {
        chat = await this.chatRepository.createChat([senderId, receiverid]);
      }
      
      const message = await this.messageRepository.createMessage(
        chat._id.toString(),
        senderId,
        text,
        type
      );

      const populatedMessage = await MessageModel.findById(message._id)
      .populate('sender','profilePicture')
      .lean() as IPopulatedMessage

      return{
        chat,
        message:populatedMessage,
      }
  }

  async myChats(userId: string): Promise<Userchats[] | null> {
    const chats = await this.chatRepository.findChatsByUserId(userId);
  
    const formattedChats = await Promise.all(
      chats.map(async (chat) => {
        const otherUserId = chat.members.find((id) => id.toString() !== userId);
        const otherUser = await this.userRepository.findById(otherUserId?.toString() || "");
  
        const lastMessage = await this.messageRepository.findLastMessage(chat._id?.toString());
  
        return {
          _id: chat._id.toString(),
          otherUser: {
            _id: otherUser?._id,
            username: otherUser?.username,
            profilePic: otherUser?.profilePicture,
            isOnline: otherUser?.isOnline,
          },
          lastMessage: lastMessage || null,
          updatedAt: chat.updatedAt!,
        };
      })
    );
  
    return formattedChats;
  }

  async getMessagesByChatId(chatId:string,page:number,limit:number) : Promise<PaginatedMessages>{
     return await this.messageRepository.findMessagesByChatId(chatId,page,limit)
  }
  
}
