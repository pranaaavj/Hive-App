import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./basequery";


interface BackendPost {
  _id: string;
  user: { username: string; profilePicture?: string };
  imageUrls: string[];
  caption: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}
interface PostsResponse {
  success: boolean;
  message: string;
  posts: BackendPost[];
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