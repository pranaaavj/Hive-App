import { NotificationService } from "../../../application/usecases/notificationService";
import { INotification } from "../../../infrastructure/model/notification";
import { RequestWithUser } from "../../../types/RequestWithUser";
import { Response, NextFunction} from "express";
import { ApiError } from "../../../utils/apiError";

export class NotificationController {

    constructor(
        private notificationService: NotificationService
    ) {}

    getNotifications = async(req: RequestWithUser, res: Response, next: NextFunction) : Promise<void> => {
        try {
        const userId = req.user?.userId
        if(!userId) {
            throw new ApiError("user not authorised", 401)
        }

        const notification = await this.notificationService.getNotifications(userId)

        res.status(200).json(notification)
            
        } catch (error) {
            next(error)
        }
    }
}