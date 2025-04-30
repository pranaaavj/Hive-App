// src/app/repositories/user.repository.ts
import User, {IUserModel} from '../../infrastructure/model/user.model'
import TempUser, {ITempUserModel} from '../../infrastructure/model/tempUser';
import { IRegisterUserDTO } from '../../domain/entities/user.entity';

export class UserRepository {
  async createTempUser(userData: IRegisterUserDTO): Promise<ITempUserModel> {
    const user = new TempUser(userData);
    return await user.save();
  }

  async createUser(userData: IRegisterUserDTO): Promise<IUserModel> {
    const user = new User(userData);
    return await user.save();
  }

  async findTempUserByEmail(email: string): Promise<ITempUserModel | null> {
    return await TempUser.findOne({ email });
  }

  async findTempUserByVerificationToken(token: string): Promise<ITempUserModel | null> {
    return await TempUser.findOne({ verificationToken: token });
  }

  async findUserByEmail(email: string): Promise<IUserModel | null> {
    return await User.findOne({ email });
  }

  async findUserById(id: string): Promise<IUserModel | null> {
    return await User.findById(id);
  }

  async deleteTempUserByEmail(email: string): Promise<{ deletedCount?: number }> {
    return await TempUser.deleteOne({ email });
  }

  async findUserByResetToken(token: string) {
    return await User.findOne({resetPasswordToken:token });
  }
}
