import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./basequery";

export const chatApi = createApi({
    reducerPath: "chatApi",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getChats: builder.query({
            query: () => ({
                url: `/messages/chats`,
                method: "GET"
            })  
        }),
    getMessages: builder.query({
        query: (chatId) => ({
            url: `/messages/${chatId}`,
            method: "GET"
        })
    }),
    sendMessage: builder.mutation({
        query:({senderId,receiverId,text})=>({
            url:`/messages/send-message`,
            method:'POST',
            body:{senderId,receiverId,text}
        })
    })
    })
})

export const {useGetChatsQuery, useLazyGetMessagesQuery,useSendMessageMutation} = chatApi;
