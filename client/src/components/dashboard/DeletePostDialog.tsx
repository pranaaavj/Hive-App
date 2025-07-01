"use client";

import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader,
         AlertDialogTitle, AlertDialogDescription,
         AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
         AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// Props
interface DeletePostDialogProps {
  postId: string;
  onDelete: (postId: string) => Promise<void>;
  disabled?: boolean;
}

export function DeletePostDialog({
  postId,
  onDelete,
  disabled,
}: DeletePostDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onDelete(postId);
    setLoading(false);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {/* The button that OPENS the dialog */}
      <AlertDialogTrigger asChild disabled={disabled}>
        <Button variant="ghost" size="sm" className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Post
        </Button>
      </AlertDialogTrigger>

      {/* Actual dialog UI */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this post?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone and will permanently remove the post
            from the platform.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
