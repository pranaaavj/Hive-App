// Type for raw post data received from backend
export interface BackendPost {
  _id: string;
  userId: string;
  caption: string;
  imageUrls: string[];
  likes: string[]; // array of userIds
  likeCount: number;
  commentCount: number;
  createdAt: string;
  user: {
    username: string;
    profilePicture?: string;
  };
}


export interface PostsResponse {
  success: boolean;
  message: string;
  posts: BackendPost[];
  hasMore: boolean;
}

export interface Post {
  _id: string;
  user: {
    username: string;
    profilePicture: string;
  };
  image: string;
  caption: string;
  likes: string[]; // same as BackendPost.likes
  likeCount: number;
  commentCount: number;
  timestamp: string; // formatted date string
  comments: { username: string; text: string }[]; // frontend only
}
