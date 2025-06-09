// src/components/PostCard.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MessageCircle, Send, MoreHorizontal } from "lucide-react";
import { Post } from "@/types/auth";

interface PostCardProps {
  post: Post;
  // onLike: (postId: string) => void;
  // onSave: (postId: string) => void;
  // isLiked: boolean;
  // isSaved: boolean;
}

export function PostCard({ post /*, onLike, onSave, isLiked, isSaved*/ }: PostCardProps) {
  return (
    <Card className="overflow-hidden shadow-md bg-white">
      <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8 border-2 border-amber-200">
            <AvatarImage src={post.user.profilePicture || "/placeholder.svg"} alt={post.user.username} />
            <AvatarFallback>{post.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <span className="font-semibold text-sm">{post.user.username}</span>
            <p className="text-xs text-gray-500">{post.timestamp}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="w-full aspect-[4/3]">
          <img src={post.image || "/placeholder.svg"} alt="Post" className="object-cover w-full h-full" />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start p-3 space-y-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {/* <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8 p-1"
              onClick={() => onLike(post.id)}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-amber-500 text-amber-500" : ""}`} />
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
            onClick={() => onSave(post.id)}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`} />
          </Button> */}
        </div>

        <div>
          <p className="font-semibold text-sm">{post.likes.toLocaleString()} likes</p>
        </div>

        <div>
          <p className="text-sm">
            <span className="font-semibold">{post.user.username}</span> {post.caption}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}