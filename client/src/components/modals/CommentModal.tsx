"use client"

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Post } from "@/types/post"
import { useState } from "react"
import { socket } from "@/lib/socket"
import { useEffect } from "react"
import { useGetCommentsByPostIdQuery, useCreateCommentMutation, useDeleteCommentMutation } from "@/services/commentApi"
import { ReplyInput } from "../ReplyInput"
import { RepliesList } from "../RepliesList"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store/store"

interface CommentModalProps {
  open: boolean
  onClose: () => void
  post: Post
}

export const CommentModal = ({ open, onClose, post }: CommentModalProps) => {
  const [newComment, setNewComment] = useState("")
  const {
    data: commentsData,
    isLoading,
    isError,
    refetch,
  } = useGetCommentsByPostIdQuery({
    postId: post._id,
  })
  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation()
  const [deleteComment] = useDeleteCommentMutation()
  const currentUserId = useSelector((state: RootState) => state.user.user?.id)

  useEffect(() => {
    if (!post._id) return

    socket.emit("joinPost", post._id)
    socket.on("commentAdded", (data) => {
      if (data.postId === post._id) {
        refetch()
      }
    })

    return () => {
      socket.emit("leavePost", post._id)
      socket.off("commentAdded")
    }
  }, [post._id, refetch])

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    try {
      await createComment({ postId: post._id, content: newComment }).unwrap()
      socket.emit("newComment", { postId: post._id })
      setNewComment("")
    } catch (error) {
      console.error("Failed to create comment:", error)
    }
  }

  const handleDelete = async (commentId: string, postId: string) => {
    try {
      await deleteComment({ commentId, postId }).unwrap()
    } catch (error) {
      console.error("Failed to delete comment:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full mx-4 max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <h2 className="text-lg font-semibold">Comments</h2>
        </DialogHeader>

        {/* Comment list */}
        <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-0 px-1">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-gray-500">Error loading comments</div>
          ) : (
            commentsData?.data.map((comment) => (
              <div key={comment._id} className="text-sm p-3 border rounded-lg bg-gray-50 relative">
                <div className="flex justify-between items-start">
                  <span className="font-semibold">{comment.userId.username}:</span>
                  {comment.userId._id === currentUserId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className="w-4 h-4 cursor-pointer" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleDelete(comment._id, post._id)} className="text-red-500">
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
                    <span className="break-words">{comment.content}</span>
                  )}
                </div>
                {/* Replies */}
                <div className="mt-3 ml-4">
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
            e.preventDefault()
            handleSubmit()
          }}
          className="flex items-center gap-2 mt-4 flex-shrink-0"
        >
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1"
          />
          <Button type="submit" disabled={isCreating} size="sm">
            {isCreating ? "Posting..." : "Post"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
