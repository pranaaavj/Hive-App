import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { ChatController } from '../userControllers/chatController';

export function setUpChatRoutes(chatController:ChatController):Router{
    const router = Router()
    router.post('/send-message',authMiddleware,chatController.sendMessage)
    router.get("/chats", authMiddleware,chatController.myChats )
    
    return router
}