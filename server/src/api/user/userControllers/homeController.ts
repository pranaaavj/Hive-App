import { HomeService } from "../../../application/usecases/home.service";
import {Response, NextFunction } from 'express';
import { RequestWithUser } from "../../../types/RequestWithUser";
import { ApiError } from "../../../utils/apiError";

export class HomeController{
    constructor(private homeService:HomeService){}

    async getHomeFeed(req:RequestWithUser,res:Response,next:NextFunction):Promise<void>{
        try {
            const userId = req.user?.userId as string
            const {page='1' , limit ='5'} = req.query
            const {posts,hasMore} = await this.homeService.getHomeFeed(userId , parseInt(page as string),parseInt(limit as string))
            console.log(userId,'user id from the hoem controller')
            console.log(posts,'post from the post controller')
            res.status(200).json({success:true ,message:'user posts fetched successfully',posts,hasMore})
        } catch (error) {
            next(error)
        }
    }
    addStory = async(req: RequestWithUser, res: Response, next: NextFunction) : Promise<void> => {
        try {
            const userId = req.user?.userId
            if(!userId) {
                throw new ApiError("User not Authenticated", 401)
            }
            const {fileUrl, fileType} = req.body

            const story = await this.homeService.addStory(userId, fileUrl, fileType)
            
            res.status(200).json(story)
        } catch (error) {
            next(error)
        }
    }
    getStories = async(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {

            const userId = req.user?.userId
        if(!userId) {
            throw new ApiError("User not Authorised", 401)
        }
        
        const stories = await this.homeService.getStories(userId)

        res.status(200).json(stories)
            
        } catch (error) {
            next(error)
        }
        
    }
    markStorySeen = async(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId
        if(!userId) {
            throw new ApiError("user not authorised", 401)
        }

        const {storyId} = req.query
        if (typeof storyId !== 'string') {
            throw new ApiError("Story Id is required and must be a string", 400);
          }
        const result = await this.homeService.markStorySeen(userId, storyId)

        res.status(200).json(result);
            
        } catch (error) {
            next(error)
        }
        
    }
    myStory = async(req: RequestWithUser, res: Response, next: NextFunction) : Promise<void> => {
        try {

            const userId = req.user?.userId
            if(!userId) {
                throw new ApiError("User not authorised", 401)
            }
            const story = await this.homeService.myStory(userId)

            res.status(200).json(story)
            
        } catch (error) {
            next(error)
        }
      
    }
}