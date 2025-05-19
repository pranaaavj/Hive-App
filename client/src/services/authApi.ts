import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./basequery";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (loginData) => ({
        url: "auth/login",
        method: "POST",
        body: loginData,
      }),
    }),

    register: builder.mutation({
      query: (registerData) => ({
        url: "auth/register",
        method: "POST",
        body: registerData,
      }),
    }),

    resetPassword: builder.mutation<void, { token: string; password: string }>({
      query: ({ token, password }) => ({
        url: `auth/reset-password?token=${token}`,
        method: "POST",
        body: { password },
      }),
    }),

    forgetPassword: builder.mutation({
      query: ({ email }) => ({
        url: "auth/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),
    addPost: builder.mutation({
      query: ({ images, caption }) => ({
        url: "post/add-post",
        method: "POST",
        body: {images, caption}
      }),
    }),
    getUserPosts: builder.query({
      query: () => ({
        url: `post/user-posts`,
        method: "GET",
      })
    }),
    addProfilePicture: builder.mutation({
      query: ({imageUrl}) => ({
        url: "profile/profile-picture",
        method: "POST",
        body: {imageUrl}
      })
    }),
    getProfileDetails: builder.query({
      query: () => ({
        url: "profile/profile-details",
        method: "GET"
      })
    })
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useResetPasswordMutation,
  useForgetPasswordMutation,
  useAddPostMutation,
  useGetUserPostsQuery,
  useAddProfilePictureMutation,
  useGetProfileDetailsQuery
} = authApi;
