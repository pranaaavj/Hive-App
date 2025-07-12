import { IPostModel } from '../../infrastructure/model/postModel';
import { AdminUserManagementRepository } from '../repositories/adminUserManagementRepository';
import { UserManagement } from '../repositories/adminUserManagementRepository';

export class AdminUserManagementService {
  constructor(private adminUserManagementRepository: AdminUserManagementRepository) {}

  async getAllUsers(): Promise<UserManagement[] | null> {
    return this.adminUserManagementRepository.getAllUsers();
  }

  async suspendUser(userId: string, status: boolean): Promise<UserManagement | null> {
    return this.adminUserManagementRepository.suspendUser(userId, status);
  }
  async userCountAndSuspendCount(): Promise<{ userCount: number; suspendedUser: number }> {
    return this.adminUserManagementRepository.userCountAndSuspendCount();
  }
  async getAllPosts(): Promise<IPostModel[] | null> {
    return this.adminUserManagementRepository.getAllPosts();
  }
  async deletePost(postId: string): Promise<IPostModel | null> {
    return this.adminUserManagementRepository.deletePost(postId);
  }
  async postCount(): Promise<{ totalPosts: number }> {
    return this.adminUserManagementRepository.postCount();
  }
  async searchUser(query: string): Promise<UserManagement[]> {
    return this.adminUserManagementRepository.searchUser(query);
  }
}
