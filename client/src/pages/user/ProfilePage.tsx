import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Camera,
  Check,
  Heart,
  LinkIcon,
  MapPin,
  MessageCircle,
  Share2,
  UserPlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/hooks/reduxHooks";
import {
  useGetUserPostsQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/services/authApi";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { ImageCropper } from "@/components/ImageCropper";
import { updloadToCloudinary } from "@/utils/cloudinary";
import {
  useAddProfilePictureMutation,
  useGetProfileDetailsQuery,
} from "@/services/authApi";

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
  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useGetProfileDetailsQuery(userId);
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);

  // Follow/unfollow mutations
  const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowLoading }] =
    useUnfollowUserMutation();

  // Local state to track follow status for immediate UI feedback
  const [isFollowingState, setIsFollowingState] = useState(false);
  const [isFollowedState, setIsFollowedState] = useState(false);

  const [profileImage, setProfileImage] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<File | null>(null);
  const [addProfilePicture] = useAddProfilePictureMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Update local follow state from profile data
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

  const getButtonVariant = () => {
    return isFollowingState ? "outline" : "default";
  };

  const getButtonClass = () => {
    return isFollowingState
      ? "shadow-sm"
      : "bg-violet-600 hover:bg-violet-700 shadow-sm";
  };

  // Handle follow/unfollow action
  const toggleFollow = async () => {
    if (!userId || user === userId) return;

    try {
      if (isFollowingState) {
        // Optimistically update UI
        setIsFollowingState(false);

        // Call API to unfollow
        await unfollowUser(userId).unwrap();
      } else {
        // Optimistically update UI
        setIsFollowingState(true);

        // Call API to follow
        await followUser(userId).unwrap();
      }

      // Refetch profile data to ensure consistency
      refetchProfile();
    } catch (error) {
      // Revert optimistic updates on error
      setIsFollowingState(!isFollowingState);
      console.error("Failed to update follow status:", error);
    }
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setIsUploadModalOpen(true);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (file: File) => {
    setCroppedImage(file);
  };

  const handleSaveImage = async () => {
    if (!croppedImage) return;

    const url = await updloadToCloudinary(croppedImage);
    if (url) {
      setProfileImage(url);
    }
    await addProfilePicture({ imageUrl: url }).unwrap();

    setIsUploadModalOpen(false);
    setSelectedImage(null);
    setCroppedImage(null);
  };

  const handleCancelUpload = () => {
    setIsUploadModalOpen(false);
    setSelectedImage(null);
    setCroppedImage(null);
  };

  if (isLoading || isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-gradient-to-b from-amber-50 to-white p-4 sm:p-6 md:p-8 space-y-6 rounded-lg shadow-sm">
      {/* Profile Header */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-r from-amber-100 to-orange-200 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Profile Image with Upload Functionality */}
          <div className="flex-shrink-0 relative group">
            <div
              className={`relative rounded-full overflow-hidden h-32 w-32 ring-4 ring-white shadow-lg ${
                user === userId ? "cursor-pointer" : "cursor-default"
              }`}
              onClick={user === userId ? handleProfileImageClick : undefined}
            >
              <Avatar className="h-32 w-32">
                <AvatarImage
                  src={profileImage || "/placeholder.svg"}
                  alt="profile"
                />
                <AvatarFallback>
                  {(profile?.username ?? "U").charAt(0)}
                </AvatarFallback>
              </Avatar>
              {user == userId && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex-1">
            {/* User Info */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{profile?.username}</h1>
                {userData.isVerified && (
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-violet-100 text-violet-700"
                  >
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">@{userData.username}</p>
              <p className="mt-3 text-gray-700">{userData.bio}</p>

              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
                {userData.location && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1 text-violet-500" />
                    {userData.location}
                  </div>
                )}
                {userData.website && (
                  <div className="flex items-center text-violet-500">
                    <LinkIcon className="h-4 w-4 mr-1" />
                    <a
                      href={`https://${userData.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {userData.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1 text-violet-500" />
                  Joined {userData.joinDate}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <div className="flex flex-col items-center sm:items-start">
                  <span className="font-semibold">{posts?.length}</span>
                  <span className="text-muted-foreground text-sm">Posts</span>
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <span className="font-semibold">
                    {profile?.followersCount}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Followers
                  </span>
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <span className="font-semibold">
                    {profile?.followingCount}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Following
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col gap-2 mt-4 sm:mt-0">
            {user !== profile?._id && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700 shadow-sm"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button
                  variant={getButtonVariant()}
                  size="sm"
                  onClick={toggleFollow}
                  className={getButtonClass()}
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

      <Separator className="my-4" />

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="px-4 sm:px-6 lg:px-8">
        <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto bg-violet-50 rounded-lg overflow-hidden">
          <TabsTrigger
            value="posts"
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="media"
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
          >
            Media
          </TabsTrigger>
          <TabsTrigger
            value="likes"
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
          >
            Likes
          </TabsTrigger>
          <TabsTrigger
            value="about"
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
          >
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {posts?.length > 0 ? (
              posts.map((post: Post) => (
                <Card
                  key={post?._id}
                  className="overflow-hidden group hover:shadow-md transition-all duration-300 border border-gray-200"
                >
                  <CardContent className="p-0">
                    {post?.imageUrls && post.imageUrls.length > 0 && (
                      <div className="relative aspect-square w-full">
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
                    <div className="p-3">
                      <p className="text-sm line-clamp-2">{post.caption}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <p>No posts yet. Share your first post!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="media" className="mt-6">
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

        <TabsContent value="likes">
          <div className="py-12 text-center text-muted-foreground">
            <p>
              Posts liked by {profile?.username || userData.name} will appear
              here
            </p>
          </div>
        </TabsContent>

        <TabsContent value="about">
          <div className="py-6 space-y-6 max-w-2xl mx-auto">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg text-violet-700 mb-2">
                  Bio
                </h3>
                <p>{userData.bio}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-violet-700 mb-2">
                    Location
                  </h3>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-violet-500" />
                    <p>{userData.location}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-violet-700 mb-2">
                    Website
                  </h3>
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

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-violet-700 mb-2">
                    Joined
                  </h3>
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

      {/* Image Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile Picture</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex flex-col items-center space-y-4">
              <ImageCropper
                image={selectedImage}
                onCropComplete={handleCropComplete}
              />
            </div>
          )}
          <DialogFooter className="flex justify-between sm:justify-end gap-2">
            <Button variant="outline" onClick={handleCancelUpload}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveImage}
              disabled={!croppedImage}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
