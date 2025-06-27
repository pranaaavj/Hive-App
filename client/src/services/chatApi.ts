import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./basequery";

export const chatApi = createApi({
  reducerPath: "chatApi",
  tagTypes: ["Messages"],
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getChats: builder.query({
      query: () => ({
        url: `/messages/chats`,
        method: "GET",
      }),
      providesTags: ["Messages"],
    }),
    getMessages: builder.query({
      query: (chatId) => ({
        url: `/messages/${chatId}`,
        method: "GET",
      }),
      providesTags: ["Messages"],
    }),
    sendMessage: builder.mutation({
      query: ({ senderId, receiverId, text, type }) => ({
        url: `/messages/send-message`,
        method: "POST",
        body: { senderId, receiverId, text, type },
      }),
      invalidatesTags: ["Messages"],
    }),
    notifications: builder.query({
      query: () => ({
        url: "/notifications/get-notifications",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetChatsQuery,
  useLazyGetMessagesQuery,
  useSendMessageMutation,
  useNotificationsQuery,
} = chatApi;
