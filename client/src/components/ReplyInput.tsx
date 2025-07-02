import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateCommentMutation } from "@/services/commentApi";

interface ReplyInputProps{
    parentCommentId:string;
    postId:string;
}

export const ReplyInput = ({ parentCommentId, postId }: ReplyInputProps) => {
    const[showInput,setShowInput] = useState(false)
    const[replyText,setReplyText] = useState("")
    const[createComment,{isLoading}]=useCreateCommentMutation()

    const handleReplySubmit = async()=>{
        if(!replyText.trim()) return
        try {
            await createComment({
                postId,
                content:replyText,
                parentCommentId,
                depth:1
            }).unwrap()
            setReplyText("")
            setShowInput(false)
        } catch (error) {
            console.error("Failed to post reply:", error);
        }
    }

  return (
    <div className="mt-1">
      {!showInput && (
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={() => setShowInput(true)}
        >
          Reply
        </button>
      )}

      {showInput && (
        <div className="flex gap-2 mt-1">
          <Input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            disabled={isLoading}
            size={20}/>
          <Button
            size="sm"
            onClick={handleReplySubmit}
            disabled={isLoading || !replyText.trim()}
          >
            Post
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowInput(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}