import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./basequery";
import {
  Comment,
  CommentResponse,
  DeleteCommentResponse,
  CommentsResponse,
  RepliesResponse
} from "@/types/comment";

export const commentApi = createApi({
  reducerPath: "commentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Comment", "Reply"],
  endpoints: (builder) => ({
    createComment: builder.mutation<CommentResponse, Partial<Comment> & { postId: string }>({
      query: (body) => ({
        url: "/comments",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Comment", id: arg.postId },
        { type: "Reply", id: "LIST" }, // Invalidate all replies if this is a reply
      ],
    }),

    getCommentsByPostId: builder.query<CommentsResponse, { postId: string; page?: number; limit?: number }>({
      query: ({ postId, page = 0, limit = 10 }) => ({
        url: `/comments/post/${postId}`,
        params: { page, limit },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Comment" as const, id: _id })),
              { type: "Comment", id: "LIST" },
            ]
          : [{ type: "Comment", id: "LIST" }],
    }),

    getReplies: builder.query<RepliesResponse, { commentId: string; page?: number; limit?: number }>({
      query: ({ commentId, page = 0, limit = 10 }) => ({
        url: `/comments/replies/${commentId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, arg) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Reply" as const, id: _id })),
              { type: "Reply", id: arg.commentId },
            ]
          : [{ type: "Reply", id: arg.commentId }],
    }),

    deleteComment: builder.mutation<DeleteCommentResponse, { commentId: string; postId: string }>({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Comment", id: arg.commentId },
        { type: "Reply", id: arg.commentId },
        { type: "Comment", id: arg.postId }, // Important for parent post invalidation
      ],
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useGetCommentsByPostIdQuery,
  useGetRepliesQuery,
  useDeleteCommentMutation,
} = commentApi;