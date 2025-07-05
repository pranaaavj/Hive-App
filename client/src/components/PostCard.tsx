"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Heart, MessageCircle, Send, MoreHorizontal } from "lucide-react"
import type { Post } from "@/types/post"
import { useEffect, useState } from "react"
import { useLikePostMutation, useUnlikePostMutation } from "@/services/postApi"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store/store"
import { CommentModal } from "./modals/CommentModal"
import { useNavigate } from "react-router-dom"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const currentUserId = useSelector((state: RootState) => state.user.user?.id)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [likePost] = useLikePostMutation()
  const [unlikePost] = useUnlikePostMutation()
  const [showComments, setShowComments] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUserId) {
      setIsLiked(post?.likes?.includes(currentUserId))
    }
  }, [currentUserId, post?.likes])

  useEffect(() => {
    setLikeCount(post?.likeCount)
  }, [post.likeCount])

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikePost(post?._id)
        setIsLiked(false)
        setLikeCount((prev) => prev - 1)
      } else {
        await likePost({ postId: post?._id })
        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Failed to like/unlike:", error)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto overflow-hidden shadow-sm bg-white border border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <div onClick={() => navigate(`/profile/${post?.userId}`)} className="flex items-center gap-3 cursor-pointer">
          <Avatar className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-amber-200">
            <AvatarImage src={post?.user?.profilePicture || "/placeholder.svg"} alt={post?.user?.username} />
            <AvatarFallback className="text-xs lg:text-sm">
              {post?.user?.username?.substring(0, 2)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-semibold text-sm lg:text-base">{post?.user?.username}</span>
            <p className="text-xs text-gray-500">{post?.timestamp}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="w-full aspect-square">
          <img src={post?.image || "/placeholder.svg"} alt="Post" className="object-cover w-full h-full" />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start p-4 space-y-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 p-2" onClick={handleLike}>
              <Heart className={`h-6 w-6 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 p-2"
              onClick={() => setShowComments(true)}
            >
              <MessageCircle className="h-6 w-6 text-gray-700" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 p-2">
              <Send className="h-6 w-6 text-gray-700" />
            </Button>
          </div>
        </div>

        <div>
          <p className="font-semibold text-sm lg:text-base">{likeCount} likes</p>
        </div>

        <div className="w-full">
          <p className="text-sm lg:text-base">
            <span className="font-semibold">{post?.user?.username}</span>{" "}
            <span className="break-words">{post?.caption}</span>
          </p>
        </div>
      </CardFooter>

      <CommentModal open={showComments} onClose={() => setShowComments(false)} post={post} />
    </Card>
  )
}
