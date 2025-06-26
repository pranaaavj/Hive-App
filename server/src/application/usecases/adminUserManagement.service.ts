
import { AdminUserManagementRepository } from "../repositories/adminUserManagementRepository";
import { UserManagement } from "../repositories/adminUserManagementRepository";

export class AdminUserManagementService{
    constructor(private adminUserManagementRepository:AdminUserManagementRepository){}
    
    async getAllUsers():Promise<UserManagement[]|null>{
        return this.adminUserManagementRepository.getAllUsers()
    }
}