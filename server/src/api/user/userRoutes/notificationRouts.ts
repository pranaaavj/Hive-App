import { Router } from "express";
import { NotificationController } from "../userControllers/notificationController";
import { authMiddleware } from "../../../middleware/auth.middleware";

export function setUpNotificationRoutes(notificationController: NotificationController) : Router {
    const router = Router()
    router.get("/get-notifications",authMiddleware, notificationController.getNotifications)
        
    return router
}