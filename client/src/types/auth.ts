export interface RegisterFormData {
    username: string,
    email: string,
    password: string
}

export interface LoginFormData {
    identifier: string,
    password: string
}

export interface ResetPasswordFormData {
    password: string;
    confirmPassword: string;
  }

export interface User {
    id: string,
    username: string,
    email : string,

}

// src/types/index.ts
export interface Story {
  _id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: string;
  isSeen: boolean;
}

export interface UserStoryGroup {
  userId: string;
  username: string;
  profilePicture: string;
  stories: Story[];
}


export interface Post {
  id: string; // Maps to _id
  user: {
    username: string; // From user.username
    profilePicture: string; // From user.profilePicture
  };
  image: string; // From imageUrls[0]
  caption: string; // From caption
  likes: number; // From likeCount
  commentCount: number; // From commentCount
  timestamp: string; // From createdAt
  comments: { username: string; text: string }[]; // Optional, not in response
}