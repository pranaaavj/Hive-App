import {IPostModel } from "../../infrastructure/model/postModel"
import { PostRepository } from "../repositories/postRepository"
import { ApiError } from "../../utils/apiError"

export class HomeService{
    constructor(private postRepository:PostRepository){}

    async getHomeFeed(userId:string,page:number,limit:number):Promise<IPostModel[]>{
        try {
            return this.postRepository.findUserPost(userId,page,limit)
        } catch (error) {
            throw new ApiError('Error fetching Home Feed',500)
        }
    }
}
