
import { Router } from 'express';
import { UserController } from '../userControllers/authController'; 
import rateLimit from 'express-rate-limit';


export function setupUserRoutes(userController: UserController): Router {
  const router = Router();

  const registerLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 registrations per minute per IP
  });

  const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 logins per minute per IP
  });

  const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 forgot password requests per minute per IP
  });

  
router.post('/register', registerLimiter, userController.register.bind(userController));
  router.post('/login', loginLimiter, userController.login.bind(userController)); // Add .bind(userController)
  router.post('/logout', userController.logout.bind(userController)); // Bind logout as well
  router.get('/verify-email/:token', userController.verifyEmail.bind(userController));
  router.post('/refresh-token', userController.refreshToken.bind(userController)); // Bind refreshToken
  router.post('/forgot-password', forgotPasswordLimiter, userController.forgotPassword.bind(userController)); // Bind forgotPassword
  router.get('/verify-forgot-email/:token', userController.forgotVerifyEmail.bind(userController)); // Bind forgotVerifyEmail
  router.post('/reset-password', userController.resetPassword.bind(userController)); // Bind resetPassword

  return router;
}
