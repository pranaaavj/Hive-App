"use client"

import { useEffect, useRef, useState } from "react"
import { StorySection } from "@/components/StorySection"
import { PostCard } from "@/components/PostCard"
import type { Post } from "@/types/post"
import { useGetHomeFeedQuery } from "@/services/postApi"

export function HomePage() {
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const loaderRef = useRef<HTMLDivElement>(null)
  const { isError, isLoading, data, isFetching } = useGetHomeFeedQuery({ page: 1, limit: 5 })

  useEffect(() => {
    if (data) {
      const newPosts = data.posts.map((post) => ({
        _id: post._id,
        userId: post.userId,
        user: {
          username: post.user.username,
          profilePicture: post.user.profilePicture || "/placeholder.svg",
        },
        image: post.imageUrls[0] || "/placeholder.svg",
        caption: post.caption || "",
        likeCount: post.likeCount,
        likes: post.likes,
        commentCount: post.commentCount,
        timestamp: new Date(post.createdAt).toLocaleString(),
        comments: [],
      }))
      setAllPosts((prev) => [...prev, ...newPosts])
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">Error loading feed</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Story Section - Full width on mobile, constrained on desktop */}
      <div className="w-full mb-4 lg:mb-6">
        <StorySection />
      </div>

      {/* Posts Feed */}
      <div className="space-y-4 lg:space-y-6">
        {allPosts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {/* Loading indicator */}
      {isFetching && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
        </div>
      )}

      {/* Intersection observer target */}
      <div ref={loaderRef} className="h-10"></div>
    </div>
  )
}
