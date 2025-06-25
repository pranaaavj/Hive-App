import { createApi } from "@reduxjs/toolkit/query/react";
import { adminBaseQueryWithReauth } from "./adminBaseQuery"; 

export const authApi = createApi({
  reducerPath: "authApi",
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
        url: "admin/register",
        method: "POST",
        body: registerData,
      }),
    }),
    resetPassword: builder.mutation<void, { token: string; password: string }>({
      query: ({ token, password }) => ({
        url: `admin/reset-password?token=${token}`,
        method: "POST",
        body: { password },
      }),
    }),
    forgetPassword: builder.mutation({
      query: ({ email }) => ({
        url: "admin/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),
    logoutUser: builder.mutation<void, void>({
      query: () => ({
        url: "admin/logout",
        method: "POST",
        credentials: "include"
      })
    }),       
  }),
});

export const {
  useLoginMutation,
  
} = authApi;
