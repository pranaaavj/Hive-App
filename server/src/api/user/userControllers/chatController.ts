import { NextFunction } from 'express';
import { ChatService } from '../../../application/usecases/chatService';
import { RequestWithUser } from '../../../types/RequestWithUser';
import { ApiError } from '../../../utils/apiError';
import { Response,Request } from 'express';
import { getIO } from '../../../infrastructure/websocket/socket';

export class ChatController {
  constructor(private chatService: ChatService) {}
  sendMessage = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      // const userId = req.user?.userId;
      // if (!userId) throw new ApiError('not authorized user', 401);

      const { senderId, receiverId, text, type } = req.body;
      if (!senderId || !receiverId || !text) {
        throw new ApiError('missing required fields', 401);
      }
      const result = await this.chatService.sendMessage(senderId, receiverId, text, type);  
  
      res.status(201).json(result);
    } catch (error) {
        next(error)
    }
    
  };
  myChats = async(req: RequestWithUser, res: Response, next: NextFunction) : Promise<void> => {
      try {
        const userId = req?.user?.userId
      if (!userId) throw new ApiError('not authorized user', 401);
        console.log(userId)
      const myChats = await this.chatService.myChats(userId)

      res.status(200).json(myChats) 
      } catch (error) {
        next(error)
      }
  }

  getMessageByChatId = async(req:RequestWithUser,res:Response,next:NextFunction):Promise<void>=>{
    try {
      console.log('hey')
      
      const chatId = req.params.chatId
      const page = parseInt(req.query.page as string) || 0;
      const limit = parseInt(req.query.limit as string) || 20;
      if(!chatId){
        throw new ApiError('chat id not found',400)
      }
      const message = await this.chatService.getMessagesByChatId(chatId,page,limit)
      res.status(200).json({success:true,message:"Messages fetched successfully",data:message})
    } catch (error) {
      next(error)
    }
  }
  getChatByUserId = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const chatUserId = req.params.userId; 
    console.log(chatUserId, "chatUserId")

    const chat = await this.chatService.findChatByUserId(chatUserId);

    res.status(200).json(chat);

  } catch (error) {
    next(error);
  }
};
  }
   
