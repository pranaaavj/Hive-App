
import { AdminUserManagementRepository } from "../repositories/adminUserManagementRepository";
import { UserManagement } from "../repositories/adminUserManagementRepository";

export class AdminUserManagementService{
    constructor(private adminUserManagementRepository:AdminUserManagementRepository){}
    
    async getAllUsers():Promise<UserManagement[]|null>{
        return this.adminUserManagementRepository.getAllUsers()
    }

    async suspendUser(userId:string,status:boolean):Promise<UserManagement|null>{
        return this.adminUserManagementRepository.suspendUser(userId,status)
    }
    async userCountAndSuspendCount():Promise<{userCount:number,suspendedUser:number}>{
        return this.adminUserManagementRepository.userCountAndSuspendCount()
    }
}