import { INotification } from "../../infrastructure/model/notification";
import { NotificationRepository } from "../repositories/notificationRepository";

export class NotificationService {
    constructor(
        private notificationRepository: NotificationRepository
    ) {}

    async getNotifications(userId: string) : Promise<INotification[]> {
        const notifications = await this.notificationRepository.getNotifications(userId)

        return notifications
    }
}