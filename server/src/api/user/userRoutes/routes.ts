import { Router } from 'express';
import { setupUserRoutes } from './authRoute';
import {
  commentController,
  postController,
  profileController,
  userController,
  homeController,
  chatController
} from '../../../setup';
import { setupPostRoutes } from './postRoute';
import { setupCommentRoutes } from './commentRoutes';
import { setupProfileRoutes } from './profileRoute';
import { setUpHomeRoutes } from './homeRoutes';
import { setUpChatRoutes } from './chatRoute';
const router = Router();

router.use('/auth', setupUserRoutes(userController));
router.use('/profile', setupProfileRoutes(profileController));
router.use('/post', setupPostRoutes(postController));
router.use('/comments', setupCommentRoutes(commentController));
router.use('/home', setUpHomeRoutes(homeController));
router.use('/messages',setUpChatRoutes(chatController))

export { router };
