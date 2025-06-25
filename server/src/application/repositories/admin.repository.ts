import { Types } from "mongoose";
import { IAdmin,Admin } from "../../domain/entities/admin.entity";
import { AdminModel,IAdminModel } from "../../infrastructure/model/adminModel";
export interface AdminRepository {
    createNewAdmin(admin:Admin):Promise<IAdminModel>
    findByEmail(email:string):Promise<IAdminModel|null>
    findByAdminName(adminName:string):Promise<IAdminModel|null>
    findById(id:string):Promise<IAdminModel|null>
    update(id:string,data:Partial<IAdmin>):Promise<IAdminModel|null>
    findByResetToken(token:string):Promise<IAdminModel | null>
}

export class MongoAdminRepository implements AdminRepository{
    async createNewAdmin(admin: Admin): Promise<IAdminModel> {
        const adminData = {
            adminName:admin.adminName,
            email:admin.email,
            password:admin.password,
            role:admin.role,
            isVerified:admin.isVerified,
            resetPasswordToken:admin.resetPasswordToken,
            createdAt:admin.createdAt,
            updatedAt:admin.updatedAt
        }

        const savedAdmin = await AdminModel.create(adminData)
        return savedAdmin
    }

    async findByEmail(email: string): Promise<IAdminModel | null> {
        const admin = await AdminModel.findOne({email})
        return admin
    }

    async findByAdminName(adminName: string): Promise<IAdminModel | null> {
        const admin = await AdminModel.findOne({adminName})
        return admin
    }
    async findById(id: string): Promise<IAdminModel | null> {
        return await AdminModel.findOne({_id: new Types.ObjectId(id)})
    }
    async update(id: string, data: Partial<IAdmin>): Promise<IAdminModel | null> {
        const admin = await AdminModel.findByIdAndUpdate(
            new Types.ObjectId(id),
            {$set:data},
            {new:true,runValidators:true}
        )
        return admin
    }
    async findByResetToken(token: string): Promise<IAdminModel | null> {
        return await AdminModel.findOne({resetPasswordToken:token})
    }
}