import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./basequery";
import { PostsResponse } from "@/types/post";

 export const postApi = createApi({
  reducerPath: 'postApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Post'], // ✅ Add this
  endpoints: (builder) => ({
    getHomeFeed: builder.query<PostsResponse, { page: number; limit: number }>({
      query: ({ page, limit }) => ({
        url: '/home/feed',
        params: { page, limit },
      }),
      providesTags: (result) =>
        result?.posts
          ? result.posts.map((post) => ({ type: 'Post' as const, id: post._id }))
          : [],
    }),

    likePost: builder.mutation({
      query: (postId) => ({
        url: `/post/${postId}/like`,
        method: 'POST',
        credentials: 'include',
      }),
      invalidatesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),

    unlikePost: builder.mutation({
      query: (postId) => ({
        url: `/post/${postId}/unlike`,
        method: 'POST',
        credentials: 'include',
      }),
      invalidatesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),
  }),
});


export const {useGetHomeFeedQuery,useLikePostMutation,useUnlikePostMutation} = postApi