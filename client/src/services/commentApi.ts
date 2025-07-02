import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./basequery";
import {
  Comment,
  CommentResponse,
  DeleteCommentResponse,
  CommentsResponse,
  RepliesResponse,
} from "@/types/comment";

export const commentApi = createApi({
  reducerPath: "commentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Comment", "Reply"],
  endpoints: (builder) => ({
    // ✅ CREATE COMMENT OR REPLY
createComment: builder.mutation<
  CommentResponse,
  Partial<Comment> & { postId: string; parentCommentId?: string }
>({
  query: (body) => ({
    url: "/comments",
    method: "POST",
    body,
  }),
  invalidatesTags: (_, __, arg) => {
    const tags: { type: "Comment" | "Reply"; id: string }[] = [
      { type: "Comment" as const, id: arg.postId },
    ];

    if (arg.parentCommentId) {
      tags.push({ type: "Reply" as const, id: arg.parentCommentId });
    }

    return tags;
  },
}),

    // ✅ GET COMMENTS BY POST ID
    getCommentsByPostId: builder.query<
      CommentsResponse,
      { postId: string; page?: number; limit?: number }
    >({
      query: ({ postId, page = 0, limit = 10 }) => ({
        url: `/comments/post/${postId}`,
        params: { page, limit },
      }),
      providesTags: (result, __, arg) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Comment" as const,
                id: _id,
              })),
              { type: "Comment", id: "LIST" },
              { type: "Comment", id: arg.postId },
            ]
          : [
              { type: "Comment", id: "LIST" },
              { type: "Comment", id: arg.postId },
            ],
    }),

    // ✅ GET REPLIES FOR A COMMENT
    getReplies: builder.query<
      RepliesResponse,
      { commentId: string; page?: number; limit?: number }
    >({
      query: ({ commentId, page = 0, limit = 10 }) => ({
        url: `/comments/replies/${commentId}`,
        params: { page, limit },
      }),
      providesTags: (result, __, arg) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Reply" as const,
                id: _id,
              })),
              { type: "Reply", id: arg.commentId },
            ]
          : [{ type: "Reply", id: arg.commentId }],
    }),

    // ✅ DELETE COMMENT OR REPLY
    deleteComment: builder.mutation<
      DeleteCommentResponse,
      { commentId: string; postId: string }
    >({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Comment", id: arg.commentId },
        { type: "Reply", id: arg.commentId },
        { type: "Comment", id: arg.postId },
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
