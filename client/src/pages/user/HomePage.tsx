"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { PlusCircle, Heart, MessageCircle, Bookmark, MoreHorizontal, Send } from "lucide-react"
import { Link } from "react-router-dom"
import { useGetHomeFeedQuery } from "@/services/postApi"
interface Story {
  id: number
  username: string
  avatar: string
  hasUnseenStory: boolean
}

interface Post {
  id: number
  username: string
  avatar: string
  image: string
  caption: string
  likes: number
  timestamp: string
  comments: {
    username: string
    text: string
  }[]
}

export  function HomePage() {
  const [stories, setStories] = useState<Story[]>([
    { id: 1, username: "yourstory", avatar: "/placeholder.svg?height=80&width=80", hasUnseenStory: false },
    { id: 2, username: "jamesdoe", avatar: "/placeholder.svg?height=80&width=80", hasUnseenStory: true },
    { id: 3, username: "emilywong", avatar: "/placeholder.svg?height=80&width=80", hasUnseenStory: true },
    { id: 4, username: "davidjones", avatar: "/placeholder.svg?height=80&width=80", hasUnseenStory: true },
    { id: 5, username: "sophialee", avatar: "/placeholder.svg?height=80&width=80", hasUnseenStory: true },
    { id: 6, username: "mikebrown", avatar: "/placeholder.svg?height=80&width=80", hasUnseenStory: true },
    { id: 7, username: "alexsmith", avatar: "/placeholder.svg?height=80&width=80", hasUnseenStory: true },
  ])

  const {isError,isLoading,data} = useGetHomeFeedQuery({page:1,limit:5})
  const myposts = data?.posts || []
  // const [posts, setPosts] = useState<Post[]>([
  //   {
  //     id: 1,
  //     username: "emilywong",
  //     avatar: "/placeholder.svg?height=40&width=40",
  //     image: "/placeholder.svg?height=600&width=800",
  //     caption: "Beautiful day at the beach! 🏖️ #sunshine #vacation",
  //     likes: 243,
  //     timestamp: "2 hours ago",
  //     comments: [
  //       { username: "davidjones", text: "Looks amazing! Where is this?" },
  //       { username: "sophialee", text: "Enjoy your vacation! 😍" },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     username: "mikebrown",
  //     avatar: "/placeholder.svg?height=40&width=40",
  //     image: "/placeholder.svg?height=600&width=800",
  //     caption: "New coffee shop discovery in downtown ☕ #coffeelover",
  //     likes: 156,
  //     timestamp: "5 hours ago",
  //     comments: [
  //       { username: "alexsmith", text: "I need to try this place!" },
  //       { username: "jamesdoe", text: "That latte art looks perfect" },
  //     ],
  //   },
  // ])

  // const [likedPosts, setLikedPosts] = useState<number[]>([])
  // const [savedPosts, setSavedPosts] = useState<number[]>([])

  // const handleLike = (postId: number) => {
  //   if (likedPosts.includes(postId)) {
  //     setLikedPosts(likedPosts.filter((id) => id !== postId))
  //     setPosts(posts.map((post) => (post.id === postId ? { ...post, likes: post.likes - 1 } : post)))
  //   } else {
  //     setLikedPosts([...likedPosts, postId])
  //     setPosts(posts.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)))
  //   }
  // }

  // const handleSave = (postId: number) => {
  //   if (savedPosts.includes(postId)) {
  //     setSavedPosts(savedPosts.filter((id) => id !== postId))
  //   } else {
  //     setSavedPosts([...savedPosts, postId])
  //   }
  // }

  return (
    <>
      {/* Stories - Fixed height and consistent sizing */}
      <section className="bg-white rounded-xl shadow-sm mb-4">
        <div className="p-3">
          <ScrollArea className="w-full">
            <div className="flex gap-4 py-2">
              <div className="flex flex-col items-center space-y-1 w-20">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 p-[2px]">
                    <Avatar className="w-full h-full border-2 border-white">
                      <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Your Story" />
                      <AvatarFallback>YS</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-md">
                    <PlusCircle className="w-5 h-5 text-amber-500" />
                  </div>
                </div>
                <span className="text-xs font-medium text-center truncate w-full">Your Story</span>
              </div>

              {stories.slice(1).map((story) => (
                <div key={story.id} className="flex flex-col items-center space-y-1 w-20">
                  <div
                    className={`w-16 h-16 rounded-full ${story.hasUnseenStory ? "bg-gradient-to-br from-amber-300 to-amber-500" : "bg-gray-200"} p-[2px]`}
                  >
                    <Avatar className="w-full h-full border-2 border-white">
                      <AvatarImage src={story.avatar || "/placeholder.svg"} alt={story.username} />
                      <AvatarFallback>{story.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-xs font-medium text-center truncate w-full">{story.username}</span>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </section>

      {/* Feed - Fixed height calculation and post sizing */}
      <div className="h-[calc(100vh-140px)] overflow-auto pr-2">
        <div className="space-y-4">
          {myposts.map((post) => (
            <Card key={post._id} className="overflow-hidden shadow-md bg-white">
              {/* Post Header */}
              <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 border-2 border-amber-200">
                    <AvatarImage src={post.userId.profilePicture || "/placeholder.svg"} alt={post.userId.username} />
                    <AvatarFallback>{post.userId.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-semibold text-sm">{post.userId.username}</span>
                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>

              {/* Post Image - Fixed aspect ratio */}
              <CardContent className="p-0">
                <div className="w-full aspect-[4/3]">
                  <img src={post.imageUrls[0] || "/placeholder.svg"} alt="Post" className="object-cover w-full h-full" />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col items-start p-3 space-y-2">
                {/* Post Actions */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    {/* <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8 p-1"
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart
                        className={`h-5 w-5 ${likedPosts.includes(post.id) ? "fill-amber-500 text-amber-500" : ""}`}
                      />
                    </Button> */}
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-1">
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-1">
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                  {/* <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 p-1"
                    onClick={() => handleSave(post.id)}
                  >
                    <Bookmark
                      className={`h-5 w-5 ${savedPosts.includes(post.id) ? "fill-amber-500 text-amber-500" : ""}`}
                    />
                  </Button> */}
                </div>

                {/* Likes */}
                {/* <div>
                  <p className="font-semibold text-sm">{post.likes.toLocaleString()} likes</p>
                </div> */}

                {/* Caption */}
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">{post.userId.username}</span> {post.caption}
                  </p>
                </div>

                {/* Comments */}
                {/* {post.comments.length > 0 && (
                  <div className="w-full">
                    <Link to="#" className="text-gray-500 text-xs block mb-1">
                      View all comments
                    </Link>
                    {post.comments.map((comment, index) => (
                      <div key={index} className="flex justify-between items-start mt-1">
                        <p className="text-sm">
                          <span className="font-semibold">{comment.username}</span> {comment.text}
                        </p>
                        <Button variant="ghost" size="icon" className="h-6 w-6 p-1">
                          <Heart className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )} */}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
