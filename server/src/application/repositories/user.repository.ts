// src/application/repositories/user.repository.ts
import { Types } from 'mongoose';
import { IUser,User } from '../../domain/entities/user.entity'; 
import { UserModel,IUserModel } from '../../infrastructure/model/user.model'; 
import { RedisClient } from '../../infrastructure/cache/redis';

export interface UserRepository {
  createUser(user: User): Promise<IUserModel>;
  findById(id: string): Promise<IUserModel | null>;
  findByEmail(email: string): Promise<IUserModel | null>;
  findByUsername(username: string): Promise<IUserModel | null>;
  findByEmailOrUsername(identifier: string): Promise<IUserModel | null>;
  findByResetToken(token: string): Promise<IUserModel | null>;
  update(id: string, data: Partial<IUser>): Promise<IUserModel | null>;
}

export class MongoUserRepository implements UserRepository {
  private redis: RedisClient;

  constructor() {
    this.redis = new RedisClient();
  }

  async createUser(user: User): Promise<IUserModel> {
    const userData = {
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      isVerified: user.isVerified,
      resetPasswordToken: user.resetPasswordToken,
      isDeleted: user.isDeleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    const savedUser = await UserModel.create(userData);
    return savedUser;
  }

  async findById(id: string): Promise<IUserModel | null> {
    // const cacheKey = `user:${id}`;
    // const cached = await this.redis.get(cacheKey);
    // if (cached) {
    //   return JSON.parse(cached);
    // }

    const user = await UserModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false });
    // if (user && this.redis.client) {
    //   await this.redis.setEx(cacheKey, JSON.stringify(user), 60);
    // }
    return user;
  }

  async findByEmail(email: string): Promise<IUserModel | null> {
    const cacheKey = `user:email:${email}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      
      return JSON.parse(cached);
    }

    const user = await UserModel.findOne({ email, isDeleted: false });
    if (user && this.redis.client) {
      await this.redis.setEx(cacheKey, JSON.stringify(user), 60);
    }
    return user;
  }

  async findByUsername(username: string): Promise<IUserModel | null> {
    const cacheKey = `user:username:${username}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await UserModel.findOne({ username, isDeleted: false });
    if (user && this.redis.client) {
      await this.redis.setEx(cacheKey, JSON.stringify(user), 60);
    }
    return user;
  }

  // In your repository class
async findByEmailOrUsername(identifier: string): Promise<IUserModel | null> {
  const cacheKey = `user:identifier:${identifier}`;
  const cachedUserId = await this.redis.get(cacheKey);
  
  if (cachedUserId) {
    // Fetch full user by ID to retain Mongoose methods like comparePassword
    const cachedUser = await UserModel.findById(cachedUserId);
    if (cachedUser) return cachedUser;
  }


  let user = await UserModel.findOne({ email: identifier, isDeleted: false });
  if (!user) {
    user = await UserModel.findOne({ username: identifier, isDeleted: false });
  }

  if (user && this.redis.client) {
    await this.redis.setEx(cacheKey, (user._id as any).toString(), 60);
  }

  return user;
}

  async findByResetToken(token: string): Promise<IUserModel | null> {
    return await UserModel.findOne({ resetPasswordToken: token, isDeleted: false });
  }

  async update(id: string, data: Partial<IUser>): Promise<IUserModel | null> {
    const user = await UserModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { $set: data },
      { new: true, runValidators: true }
    );
    if (user && this.redis.client) {
      await this.redis.client.del(`user:${id}`);
      await this.redis.client.del(`user:email:${user.email}`);
      await this.redis.client.del(`user:username:${user.username}`);
      await this.redis.client.del(`user:identifier:${user.email}`);
      await this.redis.client.del(`user:identifier:${user.username}`);
    }
    return user;
  }
}