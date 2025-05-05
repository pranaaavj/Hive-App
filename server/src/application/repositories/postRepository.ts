import { Post, IPostModel } from '../../infrastructure/model/postModel';
import { IPost } from '../../domain/entities/postEntity';
import mongoose from 'mongoose';

export class PostRepository {
  async createPost(data: IPost): Promise<IPostModel> {
    const post = new Post(data);
    return await post.save();
  }
  async getAllPosts(): Promise<IPostModel[]> {
    return await Post.find().sort({ createdAt: -1 });
  }
  async getPostById(id: string): Promise<IPostModel | null> {
    return await Post.findById(id);
  }
  async deletePost(id: string): Promise<IPostModel | null> {
    return await Post.findByIdAndDelete(id);
  }
  async likePost(postId: string, userId: string): Promise<IPostModel | null> {
    return await Post.findByIdAndUpdate(postId, {
      $addToSet: { likes: new mongoose.Types.ObjectId(userId) },
    });
  }
  async unlikePost(postId: string, userId: string): Promise<IPostModel | null> {
    return await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: new mongoose.Types.ObjectId(userId) } },
      { new: true }
    );
}
}
