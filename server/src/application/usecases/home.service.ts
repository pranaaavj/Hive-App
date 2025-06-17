import { IPostModel } from '../../infrastructure/model/postModel';
import { PostRepository } from '../repositories/postRepository';
import { ApiError } from '../../utils/apiError';
import { IStory, IStoryDocument } from '../../infrastructure/model/StoryModel';
import { StoryRepository } from '../repositories/storyRepository';
import { Types } from 'mongoose';

export class HomeService {
  constructor(
    private postRepository: PostRepository,
    private storyRepository: StoryRepository,
  ) {}

    async getHomeFeed(userId:string,page:number,limit:number):Promise<{posts:IPostModel[];hasMore:boolean}>{
        try {
            return this.postRepository.findUserPost(userId,page,limit)
        } catch (error) {
            throw new ApiError('Error fetching Home Feed',500)
        }

  }
  async addStory(userId: string, fileUrl: string, fileType: string): Promise<IStory | null> {
    try {
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

      const story = await this.storyRepository.addStory(
        new Types.ObjectId(userId),
        fileUrl,
        fileType,
        createdAt,
        expiresAt,
      );

      return story as IStory | null;
    } catch (error) {
      throw new ApiError('Error creating story', 500);
    }
  }
  async getStories(userId: string) : Promise<any | null> {
    const stories = await this.storyRepository.getStories(userId)

    return stories
  }
  async markStorySeen(userId: string, storyId: string) : Promise<any | null> {
    const story = await this.storyRepository.findById(storyId)
    
    if(!story) {
      throw new ApiError("the story not found", 404)
    }
    const alreadySeen = story.viewers.includes(userId as any)

    if(!alreadySeen) {
      story.viewers.push(new Types.ObjectId(userId))
        await story.save()
      
    }

    return {message: "story marked as seen"}

  }
  async myStory(userId: string) : Promise<any | null> {
    const story = await this.storyRepository.getMyStories(userId)
    if(!story) {
      return null
    }
    return story
  }
}
