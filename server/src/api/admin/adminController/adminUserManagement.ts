import { NextFunction, Request, Response } from 'express';
import { AdminUserManagementService } from '../../../application/usecases/adminUserManagement.service';
import { ApiError } from '../../../utils/apiError';


export class AdminUserManagementController{
    constructor(private adminUserManagementService:AdminUserManagementService){}

    async getAllUsers(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const allUsers = await this.adminUserManagementService.getAllUsers()
            if(!allUsers){
                console.log('failed to load users',allUsers)
            }
            res.status(200).json({success:true,message:'users fetched',allUsers})
        } catch (error) {
            next(error)
        }
    }
}