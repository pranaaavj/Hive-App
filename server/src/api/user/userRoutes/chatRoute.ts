import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { ChatController } from '../userControllers/chatController';

export function setUpChatRoutes(chatController:ChatController):Router{
    const router = Router()
    router.post('/send-message' ,chatController.sendMessage)
    router.get("/chats",authMiddleware, chatController.myChats)
    router.get('/:chatId',chatController.getMessageByChatId)
    router.get("/find-chat/:userId", chatController.getChatByUserId);
    return router
}