// src/pages/HomePage.tsx
"use client";

import { useState } from "react";
import { StorySection } from "@/components/StorySection"; 
import { PostCard } from "@/components/PostCard";
import { Post,Story } from "@/types/auth";
import { useGetHomeFeedQuery } from "@/services/postApi";

export function HomePage() {
  const [stories] = useState<Story[]>([
    { id: 1, username: "yourstory", avatar: "/placeholder.svg?height=80&width=80", hasUnseenStory: false },
    { id: 2, username: "jamesdoe", avatar: "/placeholder.svg?height=80&width=80", hasUnseenStory: true },
    { id: 3, username: "emilywong", avatar: "/placeholder.svg?height=80&width=80", hasUnseenStory: true },
    { id: 4, username: "davidjones", avatar: "/placeholder.svg?height=80&width=80", hasUnseenStory: true },
    { id: 5, username: "sophialee", avatar: "/placeholder.svg?height=80&width=80", hasUnseenStory: true },
    { id: 6, username: "mikebrown", avatar: "/placeholder.svg?height=80&width=80", hasUnseenStory: true },
    { id: 7, username: "alexsmith", avatar: "/placeholder.svg?height=80&width=80", hasUnseenStory: true },
  ]);

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
      <StorySection stories={stories} />
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