
import { Router } from 'express';
import { setupUserRoutes } from './authRoute'; 
import { commentController, postController, profileController, userController } from '../../../setup';
import { setupPostRoutes } from './postRoute';
import { setupCommentRoutes } from './commentRoutes';
import { setupProfileRoutes } from './profileRoute';

const router = Router()

router.use("/auth", setupUserRoutes(userController))
router.use("/profile", setupProfileRoutes(profileController))
router.use("/post", setupPostRoutes(postController))
router.use("/comments", setupCommentRoutes(commentController))


export {router}