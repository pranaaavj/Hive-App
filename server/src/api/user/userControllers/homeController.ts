import { HomeService } from "../../../application/usecases/home.service";
import {Response, NextFunction } from 'express';
import { RequestWithUser } from "../../../types/RequestWithUser";

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
}