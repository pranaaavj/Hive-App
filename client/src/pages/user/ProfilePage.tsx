"use client"

import { useState, useEffect } from "react"
import { Calendar, Edit, Heart, MessageCircle, Share2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNavigate, useParams } from "react-router-dom"
import { useAppSelector } from "@/hooks/reduxHooks"
import { useGetUserPostsQuery, useFollowUserMutation, useUnfollowUserMutation } from "@/services/authApi"
import { useGetProfileDetailsQuery } from "@/services/authApi"
import { FollowingFollowersModal } from "@/components/modals/FollowingFollowersModal"
import { useMyStoriesQuery, useMarkStorySeenMutation } from "@/services/postApi"
import { StoriesModal } from "@/components/modals/StoriesModal"
import type { Story } from "@/components/StorySection"

// Types for our data models
export type Post = {
  _id: string
  userId: string
  caption: string
  imageUrls: string[]
  likes: string[]
  likeCount: number
  commentCount: number
}

const postsData = [
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
  const user = useAppSelector((state) => state.user.user?.id)
  const { userId } = useParams()
  const { data, isLoading } = useGetUserPostsQuery(userId)
  const { data: myStories, refetch: refetchStories } = useMyStoriesQuery(undefined)
  const { data: profile, isLoading: isProfileLoading, refetch: refetchProfile } = useGetProfileDetailsQuery(userId)

  const [posts, setPosts] = useState([])
  const navigate = useNavigate()
  const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation()
  const [unfollowUser, { isLoading: isUnfollowLoading }] = useUnfollowUserMutation()
  const [isFollowingState, setIsFollowingState] = useState(false)
  const [isFollowedState, setIsFollowedState] = useState(false)
  const [profileImage, setProfileImage] = useState("")
  const isOwnProfile = user == userId
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<"followers" | "following">("followers")
  const [openStoriesModal, setOpenStoriesModal] = useState(false)
  const [markStorySeen] = useMarkStorySeenMutation()

  const openFollowersModal = () => {
    setModalType("followers")
    setModalOpen(true)
  }

  const openFollowingModal = () => {
    setModalType("following")
    setModalOpen(true)
  }

  useEffect(() => {
    if (userId) {
      setProfileImage("")
    }
    if (data?.posts) {
      setPosts(data.posts)
    }
    if (profile?.profilePicture) {
      setProfileImage(profile.profilePicture)
    }
    if (profile) {
      setIsFollowingState(profile.isFollowing || false)
      setIsFollowedState(profile.isFollowed || false)
    }
  }, [userId, data, profile])

  const getFollowStatus = () => {
    if (isFollowingState) return "Following"
    if (!isFollowingState && isFollowedState) return "Follow back"
    return "Follow"
  }

  const toggleFollow = async () => {
    if (!userId || user === userId) return

    try {
      if (isFollowingState) {
        setIsFollowingState(false)
        await unfollowUser(userId).unwrap()
      } else {
        setIsFollowingState(true)
        await followUser(userId).unwrap()
      }
      refetchProfile()
    } catch (error) {
      setIsFollowingState(!isFollowingState)
      console.error("Failed to update follow status:", error)
    }
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return `Joined ${date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    })}`
  }

  const handleOpenStories = () => {
    if (myStories && myStories?.stories.length > 0) {
      setOpenStoriesModal(true)
    }
  }

  const handleCloseStories = async () => {
    setOpenStoriesModal(false)
    await refetchStories()
  }

  if (isLoading || isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  const handleMarkStorySeen = async (storyId: string) => {
    try {
      await markStorySeen({ storyId }).unwrap()
    } catch (error) {
      console.error("Failed to mark story as seen:", error)
    }
  }

  return (
    <div className="w-full bg-white">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Profile Image */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                <div
                  className={`rounded-full overflow-hidden p-[3px] h-32 w-32 sm:h-40 sm:w-40 lg:h-44 lg:w-44 ${
                    myStories?.stories?.length > 0
                      ? myStories?.stories?.every((story: Story) => story.isSeen)
                        ? "bg-gray-400 cursor-pointer"
                        : "cursor-pointer bg-gradient-to-br from-amber-300 to-amber-500"
                      : ""
                  }`}
                  onClick={() => handleOpenStories()}
                >
                  <Avatar className="w-full h-full border-4 border-white shadow-lg">
                    <AvatarImage src={profileImage || "/placeholder.svg"} alt={profile?.username} />
                    <AvatarFallback className="text-2xl font-semibold">
                      {profile?.username?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              {/* Username and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{profile?.username}</h1>

                  {/* Stats - Mobile */}
                  <div className="flex justify-center lg:hidden gap-8 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{posts.length}</div>
                      <div className="text-sm text-gray-600">Posts</div>
                    </div>
                    <div className="text-center cursor-pointer" onClick={openFollowersModal}>
                      <div className="text-xl font-bold text-gray-900">{profile?.followersCount}</div>
                      <div className="text-sm text-gray-600 hover:underline">Followers</div>
                    </div>
                    <div className="text-center cursor-pointer" onClick={openFollowingModal}>
                      <div className="text-xl font-bold text-gray-900">{profile?.followingCount}</div>
                      <div className="text-sm text-gray-600 hover:underline">Following</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 min-w-0">
                  {isOwnProfile ? (
                    <Button
                      onClick={() => navigate(`/profile/edit/${userId}`)}
                      variant="outline"
                      className="bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => navigate(`/messages/${userId}`)}
                        className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        variant={getFollowStatus() === "Following" ? "outline" : "default"}
                        onClick={toggleFollow}
                        className={
                          getFollowStatus() === "Following"
                            ? "bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
                            : "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                        }
                        disabled={isFollowLoading || isUnfollowLoading}
                      >
                        {isFollowLoading || isUnfollowLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        ) : (
                          <>
                            {getFollowStatus() === "Follow" && <UserPlus className="h-4 w-4 mr-2" />}
                            {getFollowStatus() === "Follow back" && <UserPlus className="h-4 w-4 mr-2" />}
                          </>
                        )}
                        {getFollowStatus()}
                      </Button>
                    </>
                  )}
                  <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-300 shadow-sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Stats - Desktop */}
              <div className="hidden lg:flex gap-8 mb-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{posts.length}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
                <div className="text-center cursor-pointer hover:opacity-75" onClick={openFollowersModal}>
                  <div className="text-xl font-bold text-gray-900">{profile?.followersCount}</div>
                  <div className="text-sm text-gray-600 hover:underline">Followers</div>
                </div>
                <div className="text-center cursor-pointer hover:opacity-75" onClick={openFollowingModal}>
                  <div className="text-xl font-bold text-gray-900">{profile?.followingCount}</div>
                  <div className="text-sm text-gray-600 hover:underline">Following</div>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-4">
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
                  {profile?.bio || "No bio available"}
                </p>
              </div>

              {/* Join Date */}
              <div className="flex items-center justify-center lg:justify-start text-gray-500 text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                {formatJoinDate(profile?.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8 bg-gray-100">
            <TabsTrigger
              value="posts"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white font-medium"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white font-medium"
            >
              Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2">
              {posts?.length > 0 ? (
                posts.map((post: Post) => (
                  <div
                    key={post?._id}
                    className="relative aspect-square overflow-hidden group cursor-pointer bg-gray-100 rounded-lg"
                  >
                    {post?.imageUrls && post.imageUrls.length > 0 && (
                      <>
                        <img
                          src={post.imageUrls[0] || "/placeholder.svg"}
                          alt="Post image"
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-6 text-white">
                            <div className="flex items-center gap-2">
                              <Heart className="h-6 w-6 fill-current" />
                              <span className="font-semibold">{post.likeCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageCircle className="h-6 w-6 fill-current" />
                              <span className="font-semibold">{post.commentCount || 0}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center">
                  <div className="max-w-sm mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-500">Share your first post to get started!</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2">
              {postsData
                .filter((post) => post.image)
                .map((post) => (
                  <div
                    key={post.id}
                    className="relative aspect-square overflow-hidden group cursor-pointer bg-gray-100 rounded-lg"
                  >
                    <img
                      src={post.image || ""}
                      alt="Saved post"
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-6 text-white">
                        <div className="flex items-center gap-2">
                          <Heart className="h-6 w-6 fill-current" />
                          <span className="font-semibold">{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-6 w-6 fill-current" />
                          <span className="font-semibold">{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {userId && modalOpen && (
        <FollowingFollowersModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
          userId={userId}
        />
      )}

      {openStoriesModal && (
        <StoriesModal
          isOpen={openStoriesModal}
          onClose={handleCloseStories}
          userStoriesData={[myStories]}
          initialUserIndex={0}
          initialStoryIndex={0}
          onMarkStorySeen={handleMarkStorySeen}
        />
      )}
    </div>
  )
}
