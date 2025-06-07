import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./basequery";
import { PostsResponse } from "@/types/post";

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
    likePost:builder.mutation({
      query:(postId)=>({
        url:`/post/${postId}/like`,
        method:'POST',
        credentials:'include'
      })
    }),

    unlikePost:builder.mutation({
      query:(postId)=>({
        url:`/post/${postId}/unlike`,
        method:'POST',
        credentials:'include'
      })
    })
  }),
});


export const {useGetHomeFeedQuery,useLikePostMutation,useUnlikePostMutation} = postApi