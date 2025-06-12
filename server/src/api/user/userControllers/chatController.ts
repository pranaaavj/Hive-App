import { NextFunction } from 'express';
import { ChatService } from '../../../application/usecases/chatService';
import { RequestWithUser } from '../../../types/RequestWithUser';
import { ApiError } from '../../../utils/apiError';
import { Response } from 'express';

export class ChatController {
  constructor(private chatService: ChatService) {}
  sendMessage = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new ApiError('not authorized user', 401);

      const { senderId, receiverId, text } = req.body;
      if (!senderId || !receiverId || !text) {
        throw new ApiError('missing required fields', 401);
      }
      const result = await this.chatService.sendMessage(senderId, receiverId, text);
      res.status(201).json(result);
    } catch (error) {
        next(error)
    }
    
  };
  myChats = async(req: RequestWithUser, res: Response, next: NextFunction) : Promise<void> => {
      try {
        const userId = req?.query?.userId as string
      if (!userId) throw new ApiError('not authorized user', 401);
        console.log(userId)
      const myChats = await this.chatService.myChats(userId)

      res.status(200).json(myChats) 
      } catch (error) {
        next(error)
      }
  }
}
