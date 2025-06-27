import { Router } from 'express';
import { AdminUserManagementController } from '../adminController/adminUserManagement';

export function setupAdminUserManagementRoutes(adminController: AdminUserManagementController): Router {
  const router = Router();
  router.get('/getusers', adminController.getAllUsers.bind(adminController));
  router.patch('/:userId/suspend',adminController.suspendUser.bind(adminController))
  return router;
}
