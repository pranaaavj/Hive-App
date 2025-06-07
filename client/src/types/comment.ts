export interface User {
  _id: string;
  username: string;
  profilePicture?: string;
}

export interface Comment {
  _id: string;
  postId: string;
  userId: User;
  content: string;
  parentCommentId?: string;
  depth: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  replyCount?: number; // Added for reply count
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data: Comment;
}

export interface CommentsResponse {
  success: boolean;
  message: string;
  data: Comment[];
  total?: number; // For pagination
  page?: number;
  limit?: number;
}

export interface RepliesResponse extends CommentsResponse {
  parentCommentId: string;
}

export interface DeleteCommentResponse {
  success: boolean;
  message: string;
  data: {
    commentId: string;
    deletionType: "soft" | "hard";
    comment: Comment;
    postId: string; // Added for cache invalidation
  };
}