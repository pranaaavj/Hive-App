import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./basequery";

interface User {
  username: string;
  profilePicture?: string;
}

interface Post {
  _id: string;
  userId: User;
  caption?: string;
  imageUrls: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

interface PostsResponse {
  success: boolean;
  message: string;
  posts: Post[];
}

export const postApi = createApi({
  reducerPath: 'postApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getHomeFeed: builder.query<PostsResponse, { page: number; limit: number }>({
      query: ({ page, limit }) => ({
        url: '/home/feed',
        params: { page, limit },
      }),
    }),
  }),
});


export const {useGetHomeFeedQuery} = postApi