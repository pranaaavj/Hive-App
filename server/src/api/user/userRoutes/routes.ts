import { Router } from 'express';
import { setupUserRoutes } from './authRoute';
import {
  commentController,
  postController,
  profileController,
  userController,
  homeController,
  chatController,
  notificationController,
  adminController,
  adminUserManagementController

} from '../../../setup';
import { setupPostRoutes } from './postRoute';
import { setupCommentRoutes } from './commentRoutes';
import { setupProfileRoutes } from './profileRoute';
import { setUpHomeRoutes } from './homeRoutes';
import { setUpChatRoutes } from './chatRoute';

import { setUpNotificationRoutes } from './notificationRouts';

import { setupAdminAuthRoutes } from './adminRoutes';
import { setupAdminUserManagementRoutes } from '../../admin/adminRoutes/adminUserManagementRoutes';
const router = Router();

router.use('/auth', setupUserRoutes(userController));
router.use('/profile', setupProfileRoutes(profileController));
router.use('/post', setupPostRoutes(postController));
router.use('/comments', setupCommentRoutes(commentController));
router.use('/home', setUpHomeRoutes(homeController));
router.use('/messages',setUpChatRoutes(chatController))
router.use("/notifications", setUpNotificationRoutes(notificationController))

router.use('/admin',setupAdminAuthRoutes(adminController))
router.use('/admin',setupAdminUserManagementRoutes(adminUserManagementController))

export { router };
