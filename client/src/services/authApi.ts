import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./basequery";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes:["Profile"],
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
    logoutUser: builder.mutation<void, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
        credentials: "include"
      })
    }),
    addPost: builder.mutation({
      query: ({ images, caption }) => ({
        url: "post/add-post",
        method: "POST",
        body: {images, caption}
      }),
    }),
    getUserPosts: builder.query({
      query: (userId) => ({
        url: `post/user-posts?userId=${userId}`,
        method: "GET",
      })
    }),
    addProfilePicture: builder.mutation({
      query: ({imageUrl}) => ({
        url: "profile/profile-picture",
        method: "POST",
        body: {imageUrl}
      }),
      invalidatesTags: ["Profile"]
    }),
    getProfileDetails: builder.query({
      query: (userId) => ({
        url: `profile/profile-details?userId=${userId}`,
        method: "GET"
      }),
      providesTags: ["Profile"]
    }),
    searchUsers: builder.query({
      query: (query) => ({
        url: `/profile/search-users?q=${query}`,
        method: "GET"
      })
    }),
    followUser: builder.mutation({
      query: (userId) => ({
        url: `/profile/follow-user?userId=${userId}`,
        method: "POST"
      }),
      invalidatesTags: ["Profile"]
    }),
    unfollowUser: builder.mutation({
      query: (userId) =>  ({
        url: `/profile/unfollow-user?userId=${userId}`,
        method: "POST"
      })
    }),
    upadateProfile: builder.mutation({
      query: (updatedData) => ({
        url: "/profile/update-profile",
        method: "PATCH",
        body: {updatedData}
      }),
      invalidatesTags: ["Profile"]
    }),
    getFollowingUsers: builder.query({
      query: (userId) => ({
        url: `/profile/following?userId=${userId}`,
        method: "GET"
      })
    }),
    getFollowers: builder.query({
      query: (userId) => ({
        url: `/profile/followers?userId=${userId}`,
        method: "GET"
      })
    }),
    usernameAndProfile: builder.query({
      query: () => ({
        url: "/profile/username-profile",
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
  useLogoutUserMutation,
  useAddPostMutation,
  useGetUserPostsQuery,
  useAddProfilePictureMutation,
  useGetProfileDetailsQuery,
  useSearchUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useUpadateProfileMutation,
  useGetFollowingUsersQuery,
  useGetFollowersQuery,
  useUsernameAndProfileQuery  
} = authApi;
