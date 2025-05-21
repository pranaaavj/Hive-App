import { Router } from 'express';
import { ProfileControler } from '../userControllers/profileControler';
import { authMiddleware } from '../../../middleware/auth.middleware';

export function setupProfileRoutes(profileController: ProfileControler): Router {
  const router = Router();

  router.post('/profile-picture', authMiddleware, profileController.updateProfilePicture);
  router.get("/profile-details", authMiddleware, profileController.profileDetails)
  router.get("/search-users", authMiddleware, profileController.searchUsers)
  router.post("/follow-user", authMiddleware, profileController.followUser)
  router.post("/unfollow-user", authMiddleware, profileController.unfollowUser)

  return router;
}
