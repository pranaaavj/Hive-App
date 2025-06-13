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
        })
    })
})

export const {useGetChatsQuery} = chatApi;
