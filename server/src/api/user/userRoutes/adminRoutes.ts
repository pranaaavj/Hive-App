import { Router } from 'express';
import { AdminController } from '../../admin/adminController/adminAuthController';

export function setupAdminAuthRoutes(adminController: AdminController): Router {
  const router = Router();

  router.post('/register', adminController.registerAdmin.bind(adminController));
  router.post('/login', adminController.login.bind(adminController)); 
  router.get('/verify-email/:token', adminController.verifyEmail.bind(adminController));
  router.post('/refresh-token', adminController.refreshToken.bind(adminController)); 
  router.post('/forgot-password', adminController.forgotPassword.bind(adminController)); 
  router.get('/verify-forgot-email/:token', adminController.forgotVerifyEmail.bind(adminController)); 
  router.post('/reset-password', adminController.resetPassword.bind(adminController)); 
  router.post('/logout', adminController.logout.bind(adminController))
  return router;

}
