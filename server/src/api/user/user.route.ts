// src/api/user/user.route.ts
import { Router } from 'express';
import { UserController } from './user.controller';

const router = Router();
const userController = new UserController();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/refresh-token', userController.refreshToken);
router.post('/logout',  userController.logout);
router.get('/verify-email/:token', userController.verifyEmail);
router.post('/resend-verification',userController.resendVerificationEmail)
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);


export default router;
