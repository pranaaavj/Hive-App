import { UserController } from "./api/user/userControllers/authController";
import { CommentController } from "./api/user/userControllers/commentController";
import { PostController } from "./api/user/userControllers/postController";
import { ProfileControler } from "./api/user/userControllers/profileControler";
import { MongoCommentRepository } from "./application/repositories/commentRepository";
import { MongoPostRepository } from "./application/repositories/postRepository";
import { MongoProfileRepository } from "./application/repositories/profileRepository";
import { MongoUserRepository } from "./application/repositories/user.repository";
import { CommentService } from "./application/usecases/comment.service";
import { PostService } from "./application/usecases/post.service";
import { ProfileService } from "./application/usecases/profileService";
import { UserService } from "./application/usecases/user.service";
import { HomeController } from "./api/user/userControllers/homeController";
import { HomeService } from "./application/usecases/home.service";
import { MongoStoryRespository } from "./application/repositories/storyRepository";

const userRepository = new MongoUserRepository()
const userService = new UserService(userRepository)
const userController = new UserController(userService)

const postRepository = new MongoPostRepository()
const postService = new PostService(postRepository)
const postController = new PostController(postService)

const commentRepository = new MongoCommentRepository()
const commentService = new CommentService(commentRepository, postRepository)
const commentController = new CommentController(commentService)


const profileRepository = new MongoProfileRepository()
const profileService = new ProfileService(profileRepository)
const profileController = new ProfileControler(profileService)

const storyRepository = new MongoStoryRespository()
const homeService = new HomeService(postRepository,storyRepository)
const homeController = new HomeController(homeService)

export {
    userController,
    postController,
    commentController,
    profileController,
    homeController
}
