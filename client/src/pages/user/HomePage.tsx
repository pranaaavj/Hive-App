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
  Compass,
  PlusSquare,
  BookmarkIcon,
} from "lucide-react"
import { Link } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

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

export function HomePage() {
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
    
    <div className="flex h-screen overflow-hidden bg-amber-50">
     
    <SidebarProvider >
        {/* Enhanced Left Sidebar */}
        <AppSidebar />

        {/* Main Content - Fixed sizing */}
        <main className="flex-1 overflow-auto min-w-0">
          <div className="max-w-full py-4 mx-auto px-4">
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
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden shadow-md bg-white">
                    {/* Post Header */}
                    <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8 border-2 border-amber-200">
                          <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.username} />
                          <AvatarFallback>{post.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-semibold text-sm">{post.username}</span>
                          <p className="text-xs text-gray-500">{post.timestamp}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </CardHeader>

                    {/* Post Image - Fixed aspect ratio */}
                    <CardContent className="p-0">
                      <div className="w-full aspect-[4/3]">
                        <img src={post.image || "/placeholder.svg"} alt="Post" className="object-cover w-full h-full" />
                      </div>
                    </CardContent>

                    <CardFooter className="flex flex-col items-start p-3 space-y-2">
                      {/* Post Actions */}
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-8 w-8 p-1"
                            onClick={() => handleLike(post.id)}
                          >
                            <Heart
                              className={`h-5 w-5 ${likedPosts.includes(post.id) ? "fill-amber-500 text-amber-500" : ""}`}
                            />
                          </Button>
                          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-1">
                            <MessageCircle className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-1">
                            <Send className="h-5 w-5" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8 p-1"
                          onClick={() => handleSave(post.id)}
                        >
                          <Bookmark
                            className={`h-5 w-5 ${savedPosts.includes(post.id) ? "fill-amber-500 text-amber-500" : ""}`}
                          />
                        </Button>
                      </div>

                      {/* Likes */}
                      <div>
                        <p className="font-semibold text-sm">{post.likes.toLocaleString()} likes</p>
                      </div>

                      {/* Caption */}
                      <div>
                        <p className="text-sm">
                          <span className="font-semibold">{post.username}</span> {post.caption}
                        </p>
                      </div>

                      {/* Comments */}
                      {post.comments.length > 0 && (
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
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <div className="w-80 p-4 border-l border-amber-200 overflow-y-auto bg-white">
          <RightSidebar />
        </div>
    </SidebarProvider>
      </div>
     
  )
}

function AppSidebar() {
  return (
    <Sidebar  variant="sidebar" collapsible="icon" className="border-r  border-amber-200 bg-white w-64">
      <SidebarHeader className="p-4">
        <div className="flex justify-center items-center  gap-3 px-2 mb-4">
          
            <img className="h-[100px] self-center" src="/logo/hive-logo.png "/>
          
          
        </div>

        <div className="relative mt-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 w-full bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Home" className="py-3 text-sm">
              <Link to="#" className="flex items-center gap-3 font-medium">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Explore" className="py-3 text-sm">
              <Link to="#" className="flex items-center gap-3 font-medium">
                <Compass className="h-5 w-5" />
                <span>Explore</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Notifications" className="py-3 text-sm">
              <Link to="#" className="flex items-center gap-3 font-medium">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Messages" className="py-3 text-sm">
              <Link to="#" className="flex items-center gap-3 font-medium">
                <Send className="h-5 w-5" />
                <span>Messages</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Create" className="py-3 text-sm">
              <Link to="#" className="flex items-center gap-3 font-medium">
                <PlusSquare className="h-5 w-5" />
                <span>Create</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Profile" className="py-3 text-sm">
              <Link to="#" className="flex items-center gap-3 font-medium">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Saved" className="py-3 text-sm">
              <Link to="#" className="flex items-center gap-3 font-medium">
                <BookmarkIcon className="h-5 w-5" />
                <span>Saved</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings" className="py-3 text-sm">
              <Link to="#" className="flex items-center gap-3 font-medium">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Logout" className="py-3 text-sm">
              <Link to="#" className="flex items-center gap-3 font-medium">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="p-3 mt-3 bg-amber-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-amber-200">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Profile" />
              <AvatarFallback>PR</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">username</p>
              <p className="text-xs text-gray-500">Full Name</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function RightSidebar() {
  return (
    <div className="space-y-4">
      <Card className="shadow-sm border-amber-100">
        <CardHeader className="pb-2 pt-3 px-3">
          <h3 className="font-semibold text-base">Your Profile</h3>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 border-2 border-amber-200">
              <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile" />
              <AvatarFallback>PR</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">username</p>
              <p className="text-xs text-gray-500">Full Name</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="bg-amber-50 p-2 rounded-md">
              <p className="font-semibold text-sm">156</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            <div className="bg-amber-50 p-2 rounded-md">
              <p className="font-semibold text-sm">1.2K</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
            <div className="bg-amber-50 p-2 rounded-md">
              <p className="font-semibold text-sm">568</p>
              <p className="text-xs text-gray-500">Following</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-amber-100">
        <CardHeader className="pb-2 pt-3 px-3">
          <h3 className="font-semibold text-base">Suggested for you</h3>
        </CardHeader>
        <CardContent className="space-y-3 px-3 pb-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-amber-100">
                  <AvatarImage src={`/placeholder.svg?height=40&width=40&text=User${i}`} alt={`User ${i}`} />
                  <AvatarFallback>U{i}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-medium">user{i}</p>
                  <p className="text-xs text-gray-500">Followed by user{i + 1}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 text-amber-600 hover:text-amber-700 border-amber-200 hover:bg-amber-50"
              >
                Follow
              </Button>
            </div>
          ))}

          <Button
            variant="ghost"
            className="w-full text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 mt-1 h-7"
          >
            See More
          </Button>
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500 space-y-2 p-3">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
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
