import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
    reducerPath:'authApi',
    baseQuery:fetchBaseQuery({
        baseUrl: import.meta.env.VITE_BASE_URL
    }),
    endpoints:(builder)=>({
        login:builder.mutation({
            query:(loginData)=>({
                url:'user/login',
                method:'POST',
                body:loginData
            })
        }),

        register:builder.mutation({
            query:(registerData)=>({
                url:'user/register',
                method:'POST',
                body:registerData
            })
        })
    })
})


export const {useLoginMutation,useRegisterMutation} = authApi
