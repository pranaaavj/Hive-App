import { Router } from "express";
import { HomeController } from "../userControllers/homeController";
import { authMiddleware } from "../../../middleware/auth.middleware";

export function setUpHomeRoutes(homeContoller:HomeController):Router{
    const router = Router()
    router.get('/feed',authMiddleware,homeContoller.getHomeFeed.bind(homeContoller))
    return router
}

