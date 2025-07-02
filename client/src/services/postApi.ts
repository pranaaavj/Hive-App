import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./basequery";
import { PostsResponse } from "@/types/post";
import { UserStoryGroup } from "@/types/auth";

export const postApi = createApi({
  reducerPath: "postApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Post', "MyStory"],
  endpoints: (builder) => ({
    getHomeFeed: builder.query<PostsResponse, { page: number; limit: number }>({
      query: ({ page, limit }) => ({
        url: "/home/feed",
        params: { page, limit },
      }),
      providesTags: (result) =>
        result?.posts
          ? result.posts.map((post) => ({ type: 'Post' as const, id: post._id }))
          : [],
    }),

    likePost: builder.mutation({
      query: ({postId}) => ({
        url: `/post/${postId}/like`,
        method: 'POST',
        credentials: 'include',
      }),
      invalidatesTags: (_, __, postId) => [{ type: 'Post', id: postId }],
    }),

    unlikePost: builder.mutation({
      query: (postId) => ({
        url: `/post/${postId}/unlike`,
        method: 'POST',
        credentials: 'include',
      }),
      // invalidatesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),

    addStory: builder.mutation({
      query: ({ fileUrl, fileType }) => ({
        url: "/home/add-story",
        method: "POST",
        body: { fileUrl, fileType },
      }),
      invalidatesTags: ["MyStory"]
    }),

    getStories: builder.query<UserStoryGroup[], void>({
      query: () => ({
        url: "/home/stories",
        method: "GET",
      }),
    }),

    markStorySeen: builder.mutation<void, { storyId: string }>({
      query: ({ storyId }) => ({
        url: `/home/story-seen?storyId=${storyId}`,
        method: "PATCH",
      }),
    }),

    myStories: builder.query({
      query: () => ({
        url: "/home/my-story",
        method: "GET",
      }),
      providesTags: ["MyStory"]
    }),
  }),
});

export const {
  useGetHomeFeedQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useAddStoryMutation,
  useGetStoriesQuery,
  useMarkStorySeenMutation,
  useMyStoriesQuery
} = postApi;
