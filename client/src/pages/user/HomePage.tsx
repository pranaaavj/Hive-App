// src/pages/HomePage.tsx
"use client";

import { useState } from "react";
import { StorySection } from "@/components/StorySection"; 
import { PostCard } from "@/components/PostCard";
import { Post,Story } from "@/types/auth";
import { useGetHomeFeedQuery } from "@/services/postApi";

export function HomePage() {
  const { isError, isLoading, data } = useGetHomeFeedQuery({ page: 1, limit: 5 });
  const posts: Post[] = data?.posts.map((post) => ({
    id: post._id,
    user: {
      username: post.user.username || "Unknown",
      profilePicture: post.user.profilePicture || "/placeholder.svg",
    },
    image: post.imageUrls[0] || "/placeholder.svg",
    caption: post.caption || "",
    likes: post.likeCount,
    commentCount: post.commentCount,
    timestamp: new Date(post.createdAt).toLocaleString(),
    comments: [], // Add comment fetching logic if needed
  })) || [];

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading feed</div>;

  return (
    <>
      <StorySection/>
      <div className="h-[calc(100vh-140px)] overflow-auto pr-2">
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </>
  );
}