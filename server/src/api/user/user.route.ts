// src/api/user/user.route.ts
import { Router } from 'express';
import { UserController } from './user.controller';

const router = Router();
const userController = new UserController();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get("/verify-email/:token", userController.verifyEmail)

export default router;
