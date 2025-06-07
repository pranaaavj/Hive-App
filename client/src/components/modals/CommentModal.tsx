// src/components/modals/CommentModal.tsx
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Post } from "@/types/post";
import { useState } from "react";
import {
  useGetCommentsByPostIdQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} from "@/services/commentApi";
import { ReplyInput } from "../ReplyInput";
import { RepliesList } from "../RepliesList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";

interface CommentModalProps {
  open: boolean;
  onClose: () => void;
  post: Post;
}

export const CommentModal = ({ open, onClose, post }: CommentModalProps) => {
  const [newComment, setNewComment] = useState("");
  const { data: commentsData, isLoading, isError } = useGetCommentsByPostIdQuery({
    postId: post._id,
  });

  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const currentUserId = useSelector((state: RootState) => state.user.user?.id);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      await createComment({ postId: post._id, content: newComment }).unwrap();
      setNewComment("");
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  const handleDelete = async (commentId: string, postId: string) => {
    try {
      await deleteComment({ commentId, postId }).unwrap();
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl w-full">
        <DialogHeader>
          <h2 className="text-lg font-semibold">Comments</h2>
        </DialogHeader>

        {/* Comment list */}
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div>Loading comments...</div>
          ) : isError ? (
            <div>Error loading comments</div>
          ) : (
            commentsData?.data.map((comment) => (
              <div key={comment._id} className="text-sm p-2 border rounded bg-gray-50 relative">
                <div className="flex justify-between items-start">
                  <span className="font-semibold">{comment.userId.username}:</span>

                  {comment.userId._id === currentUserId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className="w-4 h-4 cursor-pointer" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleDelete(comment._id, post._id)}
                          className="text-red-500"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="mt-1">
                  {comment.isDeleted ? (
                    <i className="text-gray-500 italic">This comment was deleted</i>
                  ) : (
                    comment.content
                  )}
                </div>

                {/* Replies */}
                <div className="mt-2 ml-4">
                  <RepliesList postId={post._id} commentId={comment._id} />
                  <ReplyInput parentCommentId={comment._id} postId={post._id} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* New comment input */}
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
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Posting..." : "Post"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
