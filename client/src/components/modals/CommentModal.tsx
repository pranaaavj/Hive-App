// src/components/modals/CommentModal.tsx
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Post } from "@/types/post";
import { useState } from "react";
import { useGetCommentsByPostIdQuery } from "@/services/commentApi";

interface CommentModalProps {
  open: boolean;
  onClose: () => void;
  post: Post;
}

export const CommentModal = ({ open, onClose, post }: CommentModalProps) => {
  const [newComment, setNewComment] = useState("");
  const{data:commentsData,isLoading,isError} = useGetCommentsByPostIdQuery({postId:post._id})
  const handleSubmit = () => {
    console.log("Submit:", newComment); 
    setNewComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl w-full">
        <DialogHeader>
          <h2 className="text-lg font-semibold">Comments</h2>
        </DialogHeader>

        {/* Placeholder comment list */}
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {/* Example static comment */}
          {isLoading ?(
          <div>Loading comments...</div>
          ):isError?(
               <div>Error loading comments</div>
          ):(
              commentsData?.data.map((comment) => (
              <div key={comment._id} className="text-sm p-2 border rounded bg-gray-50">
                <span className="font-semibold">{comment.userId.username}:</span> {comment.content}
              </div>
            ))
          )}
        
        </div>

        {/* Comment input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-center gap-2 mt-4"
        >
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <Button type="submit">Post</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
