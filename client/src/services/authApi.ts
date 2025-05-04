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
        }),

        resetPassword: builder.mutation<void, { token: string; password: string }>({
            query: ({ token, password }) => ({
              url: `user/reset-password`,
              method: "POST",
              body: { token, password },
            }),
          }),

        forgetPassword:builder.mutation({
            query:({email})=>({
                url:'user/forgot-password',
                method:'POST',
                body:{email}
            })
        }),
    })
})


export const {useLoginMutation,useRegisterMutation,useResetPasswordMutation,useForgetPasswordMutation} = authApi
