import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from 'react-hot-toast';
import { toast } from 'react-hot-toast';

import { DeletePostDialog } from "./DeletePostDialog"; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Eye, Flag, Heart, MessageCircle, Share } from "lucide-react";
import { useGetAllPostsQuery,useDeletePostMutation, usePostCountQuery } from "@/services/adminApi";

export interface AdminPost {
  _id: string;
  userId: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  caption: string;
  imageUrls: string[];
  likes: string[];          // Array of user IDs who liked the post
  likeCount: number;
  commentCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}


export const PostsSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteUserPost, { isLoading: isDeleting }] = useDeletePostMutation();
  const{data:allposts,refetch} = useGetAllPostsQuery(undefined)
  const{data} = usePostCountQuery(undefined)

 const handleDeletePost = async (postId: string) => {
  try {
    await deleteUserPost(postId).unwrap();
    toast.success("Post deleted successfully"); // optional toast
    await refetch()
  } catch (error) {
    console.error("Failed to delete post:", error);
    toast.error("Failed to delete post");
  }
};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-2">Review and moderate user-generated content</p>
        </div>
        <Button>Create Post</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{data?.totalPosts}</div>
            <div className="text-sm text-gray-600">Published Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">34</div>
            <div className="text-sm text-gray-600">Flagged Content</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">67</div>
            <div className="text-sm text-gray-600">Under Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">1.2M</div>
            <div className="text-sm text-gray-600">Total Engagement</div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>Monitor and moderate all user-generated content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search posts by author or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allposts?.posts?.map((post:AdminPost) => (
                  <TableRow key={post._id}>
                    
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={post.userId.profilePicture} />
                          <AvatarFallback>{post.userId.username.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{post.userId.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{post.caption ?? 'no caption'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* <span>{getTypeIcon(post.type)}</span> */}
                        {/* <span className="capitalize">{post.type}</span> */}
                      </div>
                    </TableCell>
                    <TableCell>
              
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likeCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post.commentCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <Share className="h-4 w-4" />
                          {/* {post.shares} */}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* {post.reports > 0 ? ( */}
                        {/* // <Badge variant="destructive">{post.createdAt}</Badge> */}
                      {/* ) : ( */}
                        {/* // <span className="text-gray-400">0</span> */}
                      {/* )} */}
                    </TableCell>
                    <TableCell>{post.createdAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Flag className="mr-2 h-4 w-4" />
                            Flag Content
                          </DropdownMenuItem>
                          <DeletePostDialog
                                postId={post._id}
                                onDelete={handleDeletePost}
                                disabled={isDeleting}
                          ></DeletePostDialog>
                          {/* <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Post
                          </DropdownMenuItem> */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
        <Toaster position="top-right" />
    </div>
  );
};