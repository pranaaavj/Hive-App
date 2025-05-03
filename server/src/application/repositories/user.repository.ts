// src/app/repositories/user.repository.ts
import User, { IUserModel } from '../../infrastructure/model/user.model'
import { IRegisterUserDTO } from '../../domain/entities/user.entity'; 

export class UserRepository {
  async createUser(userData: IRegisterUserDTO): Promise<IUserModel> {
    const user = new User(userData);
    return await user.save();
  }

  async findUserByEmail(email: string): Promise<IUserModel | null> {
    return await User.findOne({ email });
  }

  async findUserById(id: string): Promise<IUserModel | null> {
    return await User.findById(id);
  }
  async findUserByResetToken(token: string) {
    return await User.findOne({resetPasswordToken:token });
  }
  
}
