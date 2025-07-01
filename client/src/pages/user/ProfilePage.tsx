import { useState, useEffect, use } from "react";
import {
  Calendar,
  Edit,
  Heart,
  LinkIcon,
  MapPin,
  MessageCircle,
  Share2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/hooks/reduxHooks";
import {
  useGetUserPostsQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/services/authApi";

import { useGetProfileDetailsQuery } from "@/services/authApi";
import { FollowingFollowersModal } from "@/components/modals/FollowingFollowersModal";
import { useMyStoriesQuery, useMarkStorySeenMutation } from "@/services/postApi";
import { StoriesModal } from "@/components/modals/StoriesModal";

// Types for our data models
interface User {
  id: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  following: number;
  followers: number;
  posts: number;
  profileImage: string;
  coverImage: string;
  isVerified: boolean;
}

export type Post = {
  _id: string;
  userId: string;
  caption: string;
  imageUrls: string[];
  likes: string[];
  likeCount: number;
  commentCount: number;
};
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
    content:
      "Throwback to last summer in Barcelona. Missing those sunny days and amazing architecture!",
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
];

export function ProfilePage() {
  const user = useAppSelector((state) => state.user.user?.id);
  const { userId } = useParams();
  const { data, isLoading } = useGetUserPostsQuery(userId);
  const { data: myStories, refetch: refetchStories } = useMyStoriesQuery(undefined);
  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useGetProfileDetailsQuery(userId);
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowLoading }] =
    useUnfollowUserMutation();

  const [isFollowingState, setIsFollowingState] = useState(false);
  const [isFollowedState, setIsFollowedState] = useState(false);

  const [profileImage, setProfileImage] = useState("");
  const isOwnProfile = user == userId;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"followers" | "following">(
    "followers"
  );

  const [openStoriesModal, setOpenStoriesModal] = useState(false)
   const [markStorySeen] = useMarkStorySeenMutation();


  const openFollowersModal = () => {
    setModalType("followers");
    setModalOpen(true);
  };
  const openFollowingModal = () => {
    setModalType("following");
    setModalOpen(true);
  };

  useEffect(() => {
    if (userId) {
      setProfileImage("");
    }

    if (data?.posts) {
      setPosts(data.posts);
    }

    if (profile?.profilePicture) {
      setProfileImage(profile.profilePicture);
    }

    if (profile) {
      setIsFollowingState(profile.isFollowing || false);
      setIsFollowedState(profile.isFollowed || false);
    }
  }, [userId, data, profile]);

  const getFollowStatus = () => {
    if (isFollowingState) return "Following";
    if (!isFollowingState && isFollowedState) return "Follow back";
    return "Follow";
  };

  const toggleFollow = async () => {
    if (!userId || user === userId) return;

    try {
      if (isFollowingState) {
        setIsFollowingState(false);

        await unfollowUser(userId).unwrap();
      } else {
        setIsFollowingState(true);

        await followUser(userId).unwrap();
      }

      refetchProfile();
    } catch (error) {
      setIsFollowingState(!isFollowingState);
      console.error("Failed to update follow status:", error);
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return `Joined ${date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    })}`;
  };

  const handleOpenStories = () => {
    if(myStories && myStories?.stories.length > 0) {
      setOpenStoriesModal(true)
    }
  }

  const handleCloseStories = async() => {
    setOpenStoriesModal(false);
    await refetchStories()
  };

  if (isLoading || isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const handleMarkStorySeen = async (storyId: string) => {
    try {
      await markStorySeen({ storyId }).unwrap();
    } catch (error) {
      console.error("Failed to mark story as seen:", error);
    }
  };


  return (
    <div className="max-w-5xl mx-auto bg-gradient-to-b from-amber-50 to-white p-4 sm:pshadow-sm-6 md:p-8 space-y-6 rounded-lg ">
      {/* Profile Header */}
      <div className="relative px-6 py-6 bg-gradient-to-r from-amber-100 to-orange-200 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column: Profile Image */}
          <div className="flex-shrink-0 relative group self-start">
            <div
            
              className={`rounded-full overflow-hidden p-[3px] h-32 w-32  ${
                myStories?.stories?.length > 0
                  ? myStories?.stories?.every((story) => story.isSeen)
                    ? "bg-gray-400 cursor-pointer"
                    : "cursor-pointer bg-gradient-to-br from-amber-300 to-amber-500"
                  : ""
              }`}
              onClick={() => handleOpenStories()}
            >
              <Avatar className="w-full h-full border-2 border-white">
                <AvatarImage
                  src={profileImage || "/placeholder.svg"}
                  alt={profile?.username}
                />
                <AvatarFallback>{profile?.username.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Middle Column: User Info and Stats */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                {/* User Info */}
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{profile?.username}</h1>
                </div>

                {/* Stats - positioned to the right of username on desktop */}
                <div className="flex gap-8 mt-3">
                  <div className="flex flex-col items-center md:items-start">
                    <span className="font-semibold">{posts.length}</span>
                    <span className="hover:cursor-pointer hover:underline font-semiboldv text-sm">
                      Posts
                    </span>
                  </div>
                  <div className="flex flex-col items-center md:items-start">
                    <span className="font-semibold">
                      {profile?.followersCount}
                    </span>
                    <span
                      onClick={openFollowersModal}
                      className="hover:cursor-pointer hover:underline font-semiboldv text-sm"
                    >
                      Followers
                    </span>
                  </div>
                  <div className="flex flex-col items-center md:items-start">
                    <span className="font-semibold">
                      {profile?.followingCount}
                    </span>
                    <span
                      onClick={openFollowingModal}
                      className="hover:cursor-pointer hover:underline font-semiboldv text-sm"
                    >
                      Following
                    </span>
                  </div>
                </div>

                {/* Bio with fixed height */}
                <div className="mt-4 min-h-[60px]">
                  <p className="text-gray-700">
                    {profile?.bio || "No bio available"}
                  </p>
                </div>

                {/* Join Date */}
                <div className="flex items-center text-muted-foreground text-sm mt-2">
                  <Calendar className="h-4 w-4 mr-1 text-violet-500" />
                  {formatJoinDate(profile?.createdAt)}
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex flex-row  md:flex-col w-32 gap-2 mt-2 md:mt-0 md:self-start">
                {isOwnProfile ? (
                  <Button
                    onClick={() => {
                      navigate(`/profile/edit/${userId}`);
                    }}
                    variant="outline"
                    size="sm"
                    className="shadow-sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                    onClick={() => navigate(`/messages/${userId}`)}
                      variant="default"
                      size="sm"
                      className="bg-violet-600 hover:bg-violet-700 shadow-sm"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      variant={
                        getFollowStatus() === "Following"
                          ? "outline"
                          : "default"
                      }
                      size="sm"
                      onClick={toggleFollow}
                      className={
                        getFollowStatus() === "Following"
                          ? "shadow-sm"
                          : "bg-violet-600 hover:bg-violet-700 shadow-sm"
                      }
                      disabled={isFollowLoading || isUnfollowLoading}
                    >
                      {isFollowLoading || isUnfollowLoading ? (
                        "Loading..."
                      ) : (
                        <>
                          {getFollowStatus() === "Follow" && (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Follow
                            </>
                          )}
                          {getFollowStatus() === "Follow back" && (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Follow back
                            </>
                          )}
                          {getFollowStatus() === "Following" && "Following"}
                        </>
                      )}
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" className="shadow-sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="px-4 sm:px-6 lg:px-8">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto bg-violet-50 rounded-lg overflow-hidden">
          <TabsTrigger
            value="posts"
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
          >
            Saved
          </TabsTrigger>
         
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
            {posts?.length > 0 ? (
              posts.map((post: Post) => (
                <div
                  key={post?._id}
                  className="overflow-hidden group hover:shadow-md transition-all duration-300 border border-gray-200"
                >
                  <div className="p-0">
                    {post?.imageUrls && post.imageUrls.length > 0 && (
                      <div className="relative aspect-[4/5] overflow-hidden w-full">
                        <img
                          src={post.imageUrls[0] || "/placeholder.svg"}
                          alt="Post image"
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-4 text-white">
                            <div className="flex items-center gap-1">
                              <Heart className="h-5 w-5" />
                              <span>{post.likeCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-5 w-5" />
                              <span>{post.commentCount || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <p>No posts yet. Share your first post!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {postsData
              .filter((post) => post.image)
              .map((post) => (
                <div
                  key={post.id}
                  className="relative aspect-square overflow-hidden rounded-md group"
                >
                  <img
                    src={post.image || ""}
                    alt="Media"
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
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

      </Tabs>
      {userId && modalOpen && (
        <FollowingFollowersModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
          userId={userId}
        />
      )}
      { openStoriesModal && 
      <StoriesModal
        isOpen={openStoriesModal}
        onClose={handleCloseStories}
        userStoriesData={[myStories]}
        initialUserIndex={0}
        initialStoryIndex={0}
        onMarkStorySeen={handleMarkStorySeen} 
        />}

    </div>
  );
}
