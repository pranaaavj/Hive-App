// src/api/user/user.route.ts
import { Router } from 'express';
import { UserController } from '../userControllers/authController';

const router = Router();
const userController = new UserController();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get("/verify-email/:token", userController.verifyEmail) 
router.post("/refresh-token", userController.refreshToken)
router.post('/forgot-password', userController.forgotPassword);
router.get("/verify-forgot-email/:token", userController.forgotVerifyEmail)
router.post('/reset-password', userController.resetPasword);

export default router;
