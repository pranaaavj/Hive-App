import { Router } from 'express';
import { HomeController } from '../userControllers/homeController';
import { authMiddleware } from '../../../middleware/auth.middleware';

export function setUpHomeRoutes(homeController: HomeController): Router {
  const router = Router();
  router.get('/feed', authMiddleware, homeController.getHomeFeed.bind(homeController));
  router.post('/add-story', authMiddleware, homeController.addStory.bind(homeController));
  router.get('/stories', authMiddleware, homeController.getStories.bind(homeController));
  router.patch('/story-seen', authMiddleware, homeController.markStorySeen.bind(homeController));
  router.get('/my-story', authMiddleware, homeController.myStory.bind(homeController));
  return router;
}
