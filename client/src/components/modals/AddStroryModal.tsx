"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Upload, Send, ImageIcon, Video } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAddStoryMutation } from "@/services/postApi"
import { updloadToCloudinary } from "@/utils/cloudinary"

interface AddStoryModalProps {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
}

export function AddStoryModal({ isOpen, setIsOpen }: AddStoryModalProps) {
  const [addStory] = useAddStoryMutation()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleModalClose = (open: boolean) => {
    if (!open) {
      setPreviewUrl(null);
      setSelectedFile(null);
      setIsUploading(false);
    }
    setIsOpen(open);
  };


  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const resetModal = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(resetModal, 300)
  }

  const handlePublish = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const fileUrl = await updloadToCloudinary(selectedFile)
      const fileType = selectedFile.type.startsWith("image") ? "image" : "video"

      await addStory({ fileUrl, fileType })
      handleClose()
    } catch (error) {
      console.error("Error uploading story:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    resetModal()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Add to Your Story</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Area */}
          <div className="relative overflow-hidden bg-muted/30" style={{ aspectRatio: "9/16", height: "400px" }}>
            {!previewUrl ? (
              /* Upload Area */
              <div
                className="h-full flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50 transition-colors rounded-lg"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium">Drop your photo or video here</p>
                    <p className="text-xs text-muted-foreground">or click to browse files</p>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <ImageIcon className="h-3 w-3" />
                      <span>Images</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Video className="h-3 w-3" />
                      <span>Videos</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Preview Content */
              <div className="relative h-full group">
                {selectedFile?.type.startsWith("image/") ? (
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Story preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <video src={previewUrl} className="w-full h-full object-cover rounded-lg" controls muted />
                )}

                {/* Remove File Button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isUploading}>
              Cancel
            </Button>

            <Button onClick={handlePublish} disabled={!selectedFile || isUploading} className="flex-1">
              {isUploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Share Story
                </>
              )}
            </Button>
          </div>

          {/* Upload Button for Mobile/Alternative Access */}
          {!previewUrl && (
            <Button variant="ghost" onClick={() => fileInputRef.current?.click()} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Choose File
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
