import { Router } from 'express';
import { AdminUserManagementController } from '../adminController/adminUserManagement';

export function setupAdminUserManagementRoutes(adminController: AdminUserManagementController): Router {
  const router = Router();
  router.get('/getusers', adminController.getAllUsers.bind(adminController));
  router.patch('/:userId/suspend',adminController.suspendUser.bind(adminController))
  router.get('/usercount',adminController.userCountAndSuspendCount.bind(adminController))
  router.get('/getposts',adminController.getAllPosts.bind(adminController))
  router.delete('/deletepost/:postId',adminController.deletePost.bind(adminController))
  router.get('/totalposts',adminController.postCount.bind(adminController))
  router.get('/search-user', adminController.searchUser.bind(adminController));
  return router;
}
