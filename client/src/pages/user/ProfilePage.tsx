
import { useState } from "react"
import { Calendar, Heart, LinkIcon, MapPin, MessageCircle, Share2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store/store"

// Types for our data models
interface User {
  id: string
  name: string
  username: string
  bio: string
  location: string
  website: string
  joinDate: string
  following: number
  followers: number
  posts: number
  profileImage: string
  coverImage: string
  isVerified: boolean
}

interface Post {
  id: string
  content: string
  image?: string
  likes: number
  comments: number
  shares: number
  createdAt: string
  user: {
    id: string
    name: string
    username: string
    profileImage: string
  }
}

// Mock data for demonstration
const userData: User = {
  id: "1",
  name: "Alex Johnson",
  username: "alexjohnson",
  bio: "Digital creator | Photographer | Travel enthusiast | Sharing my journey through photos and stories",
  location: "San Francisco, CA",
  website: "alexjohnson.design",
  joinDate: "January 2020",
  following: 542,
  followers: 8943,
  posts: 127,
  profileImage: "/placeholder.svg?height=200&width=200",
  coverImage: "/placeholder.svg?height=400&width=1200",
  isVerified: true,
}

const postsData: Post[] = [
  {
    id: "1",
    content:
      "Just finished my latest photography project! So excited to share these shots from my trip to Norway. The landscapes were absolutely breathtaking! #photography #travel #norway",
    image: "/placeholder.svg?height=500&width=500",
    likes: 423,
    comments: 47,
    shares: 12,
    createdAt: "2 hours ago",
    user: {
      id: "1",
      name: "Alex Johnson",
      username: "alexjohnson",
      profileImage: "/placeholder.svg?height=200&width=200",
    },
  },
  {
    id: "2",
    content:
      "Working on some new edits today. What do you think of this style? Should I continue with this aesthetic for my next series?",
    image: "/placeholder.svg?height=500&width=500",
    likes: 287,
    comments: 32,
    shares: 5,
    createdAt: "2 days ago",
    user: {
      id: "1",
      name: "Alex Johnson",
      username: "alexjohnson",
      profileImage: "/placeholder.svg?height=200&width=200",
    },
  },
  {
    id: "3",
    content: "Throwback to last summer in Barcelona. Missing those sunny days and amazing architecture!",
    image: "/placeholder.svg?height=500&width=500",
    likes: 512,
    comments: 63,
    shares: 21,
    createdAt: "1 week ago",
    user: {
      id: "1",
      name: "Alex Johnson",
      username: "alexjohnson",
      profileImage: "/placeholder.svg?height=200&width=200",
    },
  },
]

export function ProfilePage() {
const username = useSelector((state: RootState) => state.user.user.username)
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState("posts")

  const toggleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  return (
    <div className="max-w-4xl mx-auto bg-amber-50 p-4 sm:p-6 md:p-8 space-y-6">
      {/* Profile Header */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-r from-amber-100 to-orange-200 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <Avatar className="h-32 w-32 ring-4 ring-background shadow-lg">
              <AvatarImage src={userData.profileImage || "/placeholder.svg"} alt={userData.name} />
              <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1">
            {/* User Info */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{username}</h1>
                {userData.isVerified && (
                  <Badge variant="secondary" className="rounded-full bg-violet-100">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">@{userData.username}</p>
              <p className="mt-3">{userData.bio}</p>

              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
                {userData.location && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {userData.location}
                  </div>
                )}
                {userData.website && (
                  <div className="flex items-center text-violet-500">
                    <LinkIcon className="h-4 w-4 mr-1" />
                    <a href={`https://${userData.website}`} target="_blank" rel="noopener noreferrer">
                      {userData.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {userData.joinDate}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <div>
                  <span className="font-semibold">{userData.posts}</span>
                  <span className="text-muted-foreground ml-1">Posts</span>
                </div>
                <div>
                  <span className="font-semibold">{userData.followers.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-semibold">{userData.following.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1">Following</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col gap-2 mt-4 sm:mt-0">
            <Button variant="default" size="sm" className="bg-violet-600 hover:bg-violet-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              onClick={toggleFollow}
              className={isFollowing ? "" : "bg-violet-600 hover:bg-violet-700"}
            >
              {isFollowing ? (
                "Following"
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="px-4 sm:px-6 lg:px-8">
        <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto bg-violet-50">
          <TabsTrigger value="posts" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            Posts
          </TabsTrigger>
          <TabsTrigger value="media" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            Media
          </TabsTrigger>
          <TabsTrigger value="likes" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            Likes
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {postsData.map((post) => (
              <Card key={post.id} className="overflow-hidden group hover:shadow-md transition-all duration-300">
                <CardContent className="p-0">
                  {post.image && (
                    <div className="relative aspect-square w-full">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt="Post image"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-4 text-white">
                          <div className="flex items-center gap-1">
                            <Heart className="h-5 w-5" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-5 w-5" />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.user.profileImage || "/placeholder.svg"} alt={post.user.name} />
                        <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-medium">{post.user.name}</div>
                      <div className="text-xs text-muted-foreground ml-auto">{post.createdAt}</div>
                    </div>
                    <p className="text-sm line-clamp-2">{post.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {postsData
              .filter((post) => post.image)
              .map((post) => (
                <div key={post.id} className="relative aspect-square overflow-hidden rounded-md group">
                  <img
                    src={post.image || ""}
                    alt="Media"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-4 text-white">
                      <div className="flex items-center gap-1">
                        <Heart className="h-5 w-5" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-5 w-5" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="likes">
          <div className="py-12 text-center text-muted-foreground">
            <p>Posts liked by {userData.name} will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="about">
          <div className="py-6 space-y-6 max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg text-violet-700 mb-2">Bio</h3>
                <p>{userData.bio}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-violet-700 mb-2">Location</h3>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-violet-500" />
                    <p>{userData.location}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-violet-700 mb-2">Website</h3>
                  <a
                    href={`https://${userData.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-violet-500 hover:text-violet-700 transition-colors"
                  >
                    <LinkIcon className="h-5 w-5 mr-2" />
                    {userData.website}
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-violet-700 mb-2">Joined</h3>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-violet-500" />
                    <p>{userData.joinDate}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
