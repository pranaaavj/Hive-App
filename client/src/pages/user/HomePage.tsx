"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  PlusCircle,
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Send,
  Search,
  Bell,
  Home,
  User,
  Settings,
  LogOut,
} from "lucide-react"


import { Link } from "react-router-dom"

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

  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      username: "emilywong",
      avatar: "/placeholder.svg?height=40&width=40",
      image: "/placeholder.svg?height=600&width=800",
      caption: "Beautiful day at the beach! 🏖️ #sunshine #vacation",
      likes: 243,
      timestamp: "2 hours ago",
      comments: [
        { username: "davidjones", text: "Looks amazing! Where is this?" },
        { username: "sophialee", text: "Enjoy your vacation! 😍" },
      ],
    },
    {
      id: 2,
      username: "mikebrown",
      avatar: "/placeholder.svg?height=40&width=40",
      image: "/placeholder.svg?height=600&width=800",
      caption: "New coffee shop discovery in downtown ☕ #coffeelover",
      likes: 156,
      timestamp: "5 hours ago",
      comments: [
        { username: "alexsmith", text: "I need to try this place!" },
        { username: "jamesdoe", text: "That latte art looks perfect" },
      ],
    },
  ])

  const [likedPosts, setLikedPosts] = useState<number[]>([])
  const [savedPosts, setSavedPosts] = useState<number[]>([])

  const handleLike = (postId: number) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter((id) => id !== postId))
      setPosts(posts.map((post) => (post.id === postId ? { ...post, likes: post.likes - 1 } : post)))
    } else {
      setLikedPosts([...likedPosts, postId])
      setPosts(posts.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)))
    }
  }

  const handleSave = (postId: number) => {
    if (savedPosts.includes(postId)) {
      setSavedPosts(savedPosts.filter((id) => id !== postId))
    } else {
      setSavedPosts([...savedPosts, postId])
    }
  }

  return (
    
    <div className="w-full min-h-screen bg-yellow-200 ">
      <Header />

      <div className="container mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="col-span-2 hidden lg:block">
          <SideNavigation />
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-7">
          {/* Stories */}
          <section className="bg-white rounded-xl shadow-sm mb-6">
            <ScrollArea className="w-full whitespace-nowrap p-4">
              <div className="flex gap-6 py-2">
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 p-[2px]">
                      <Avatar className="w-full h-full border-2 border-white">
                        <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Your Story" />
                        <AvatarFallback>YS</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-md">
                      <PlusCircle className="w-6 h-6 text-amber-500" />
                    </div>
                  </div>
                  <span className="text-sm font-medium">Your Story</span>
                </div>

                {stories.slice(1).map((story) => (
                  <div key={story.id} className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-20 h-20 rounded-full ${story.hasUnseenStory ? "bg-gradient-to-br from-amber-300 to-amber-500" : "bg-gray-200"} p-[2px]`}
                    >
                      <Avatar className="w-full h-full border-2 border-white">
                        <AvatarImage src={story.avatar || "/placeholder.svg"} alt={story.username} />
                        <AvatarFallback>{story.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="text-sm font-medium">{story.username}</span>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>

          {/* Feed */}
          <section className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden shadow-md">
                {/* Post Header */}
                <CardHeader className="flex flex-row items-center justify-between py-4 px-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-amber-200">
                      <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.username} />
                      <AvatarFallback>{post.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-semibold">{post.username}</span>
                      <p className="text-xs text-gray-500">{post.timestamp}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </CardHeader>

                {/* Post Image */}
                <CardContent className="p-0">
                  <div className="relative aspect-video">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt="Post"
                      
                      className="object-cover"
                      sizes="(max-width: 1200px) 100vw, 800px"
                      
                    />
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col items-start p-6 space-y-3">
                  {/* Post Actions */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-10 w-10"
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart
                          className={`h-6 w-6 ${likedPosts.includes(post.id) ? "fill-amber-500 text-amber-500" : ""}`}
                        />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                        <MessageCircle className="h-6 w-6" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                        <Send className="h-6 w-6" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-10 w-10"
                      onClick={() => handleSave(post.id)}
                    >
                      <Bookmark
                        className={`h-6 w-6 ${savedPosts.includes(post.id) ? "fill-amber-500 text-amber-500" : ""}`}
                      />
                    </Button>
                  </div>

                  {/* Likes */}
                  <div>
                    <p className="font-semibold">{post.likes.toLocaleString()} likes</p>
                  </div>

                  {/* Caption */}
                  <div>
                    <p>
                      <span className="font-semibold">{post.username}</span> {post.caption}
                    </p>
                  </div>

                  {/* Comments */}
                  {post.comments.length > 0 && (
                    <div className="w-full">
                      <Link to="#" className="text-gray-500 text-sm block mb-2">
                        View all comments
                      </Link>
                      {post.comments.map((comment, index) => (
                        <div key={index} className="flex justify-between items-start mt-2">
                          <p>
                            <span className="font-semibold">{comment.username}</span> {comment.text}
                          </p>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-3 hidden lg:block">
          <RightSidebar />
        </div>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="bg-yellow-200 shadow-sm py-3 sticky top-0 z-10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M7.5 3.5a4 4 0 0 0-4 4v1a4 4 0 0 0 4 4h1a4 4 0 0 0 4-4v-1a4 4 0 0 0-4-4h-1zM15.5 11.5a4 4 0 0 0-4 4v1a4 4 0 0 0 4 4h1a4 4 0 0 0 4-4v-1a4 4 0 0 0-4-4h-1zM15.5 3.5a4 4 0 0 0-4 4v1a4 4 0 0 0 4 4h1a4 4 0 0 0 4-4v-1a4 4 0 0 0-4-4h-1zM7.5 11.5a4 4 0 0 0-4 4v1a4 4 0 0 0 4 4h1a4 4 0 0 0 4-4v-1a4 4 0 0 0-4-4h-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-amber-600">Hive</h1>
        </div>

        <div className="relative max-w-md w-full hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 w-full bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Send className="h-6 w-6" />
          </Button>
          <Avatar className="h-10 w-10 border-2 border-amber-200">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Profile" />
            <AvatarFallback>PR</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}

function SideNavigation() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
      <nav className="space-y-2">
        <Link to="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-100 text-gray-800 font-medium">
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link to="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-100 text-gray-800 font-medium">
          <Search className="h-5 w-5" />
          <span>Explore</span>
        </Link>
        <Link to="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-100 text-gray-800 font-medium">
          <Bell className="h-5 w-5" />
          <span>Notifications</span>
        </Link>
        <Link to="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-100 text-gray-800 font-medium">
          <Send className="h-5 w-5" />
          <span>Messages</span>
        </Link>
        <Link to="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-100 text-gray-800 font-medium">
          <User className="h-5 w-5" />
          <span>Profile</span>
        </Link>
        <Link to="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-100 text-gray-800 font-medium">
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </nav>

      <div className="pt-6 mt-6 border-t">
        <Link to="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-100 text-gray-800 font-medium">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  )
}

function RightSidebar() {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <h3 className="font-semibold">Your Profile</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-amber-200">
              <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile" />
              <AvatarFallback>PR</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">username</p>
              <p className="text-sm text-gray-500">Full Name</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div>
              <p className="font-semibold">156</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            <div>
              <p className="font-semibold">1.2K</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
            <div>
              <p className="font-semibold">568</p>
              <p className="text-xs text-gray-500">Following</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <h3 className="font-semibold">Suggested for you</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`/placeholder.svg?height=40&width=40&text=User${i}`} alt={`User ${i}`} />
                  <AvatarFallback>U{i}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">user{i}</p>
                  <p className="text-xs text-gray-500">Followed by user{i + 1}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                Follow
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500 space-y-2">
        <div className="flex flex-wrap gap-x-2">
          <Link to="#" className="hover:underline">
            About
          </Link>
          <Link to="#" className="hover:underline">
            Help
          </Link>
          <Link to="#" className="hover:underline">
            Press
          </Link>
          <Link to="#" className="hover:underline">
            API
          </Link>
          <Link to="#" className="hover:underline">
            Jobs
          </Link>
          <Link to="#" className="hover:underline">
            Privacy
          </Link>
          <Link to="#" className="hover:underline">
            Terms
          </Link>
        </div>
        <p>© 2025 HIVE</p>
      </div>
    </div>
  )
}
