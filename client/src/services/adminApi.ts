import { createApi } from "@reduxjs/toolkit/query/react";
import { adminBaseQueryWithReauth } from "./adminBaseQuery"; 

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: adminBaseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (loginData) => ({
        url: "/admin/login",
        method: "POST",
        body: loginData,
      }),
    }),
    register: builder.mutation({
      query: (registerData) => ({
        url: "/admin/register",
        method: "POST",
        body: registerData,
      }),
    }),
    resetPassword: builder.mutation<void, { token: string; password: string }>({
      query: ({ token, password }) => ({
        url: `/admin/reset-password?token=${token}`,
        method: "POST",
        body: { password },
      }),
    }),
    forgetPassword: builder.mutation({
      query: ({ email }) => ({
        url: "/admin/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),
    logoutUser: builder.mutation<void, void>({
      query: () => ({
        url: "/admin/logout",
        method: "POST",
        credentials: "include"
      })
    }),  
    
    getAllUsers:builder.query({
      query:()=>({
        url:'/admin/getusers',
        method:"GET",
      })
    }),

    suspendUser:builder.mutation({
      query:({userId,status})=>({
        url:`/admin/${userId}/suspend`,
        method:"PATCH",
        body:{status}
      })
    })
  }),
});

export const {
  useLoginMutation,
  useGetAllUsersQuery,
  useSuspendUserMutation
} = adminApi;
