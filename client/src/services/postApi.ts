import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./basequery";
import { UserStoryGroup } from "@/types/auth";

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
  reducerPath: "postApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getHomeFeed: builder.query<PostsResponse, { page: number; limit: number }>({
      query: ({ page, limit }) => ({
        url: "/home/feed",
        params: { page, limit },
      }),
    }),
    addStory: builder.mutation({
      query: ({ fileUrl, fileType }) => ({
        url: "/home/add-story",
        method: "POST",
        body: { fileUrl, fileType },
      }),
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
    }),
  }),
});

export const {
  useGetHomeFeedQuery,
  useAddStoryMutation,
  useGetStoriesQuery,
  useMarkStorySeenMutation,
  useMyStoriesQuery
} = postApi;
