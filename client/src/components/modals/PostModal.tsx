import type React from "react"
import { useState, useRef } from "react"
import { X, ChevronLeft, ChevronRight, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useAddPostMutation } from "@/services/authApi"
import { updloadToCloudinary } from "@/utils/cloudinary"

interface UploadedImage {
  url: string
  file: File
}

interface PostModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (images: File[], caption: string) => Promise<void>
}

export function PostModal({ open, onOpenChange }: PostModalProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [caption, setCaption] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [addPost] = useAddPostMutation()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages: UploadedImage[] = []

      Array.from(e.target.files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          newImages.push({
            url: URL.createObjectURL(file),
            file: file,
          })
        }
      })

      setImages((prev) => [...prev, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev]
   
      URL.revokeObjectURL(newImages[index].url)
      newImages.splice(index, 1)

      if (index <= currentImageIndex && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1)
      } else if (newImages.length === 0) {
        setCurrentImageIndex(0)
      }

      return newImages
    })
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
        console.log("submitted")
      
          const uploadedUrls: string[] = []
          for(const img of images) {
            const url = await updloadToCloudinary(img.file)
            if(url) {
              uploadedUrls.push(url)
            }
          }
          console.log(uploadedUrls)
          await addPost({images: uploadedUrls, caption})
  
      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const resetForm = () => {
    // Clean up object URLs to prevent memory leaks
    images.forEach((img) => URL.revokeObjectURL(img.url))
    setImages([])
    setCaption("")
    setCurrentImageIndex(0)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen)
        if (!newOpen) resetForm()
      }}
    >
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 my-4">
          {/* Image Upload and Preview Section */}
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            {images.length > 0 ? (
              <div className="relative">
                <div className="relative aspect-square w-full bg-muted rounded-md overflow-hidden">
                  <img
                    src={images[currentImageIndex]?.url || "/placeholder.svg"}
                    alt={`Preview ${currentImageIndex + 1}`}
                    className="object-contain"
                  />

                  {/* Navigation Controls */}
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
                        onClick={handlePrevImage}
                        disabled={currentImageIndex === 0}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
                        onClick={handleNextImage}
                        disabled={currentImageIndex === images.length - 1}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </>
                  )}

                  {/* Remove Image Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 bg-black/30 hover:bg-black/50 text-white rounded-full"
                    onClick={() => removeImage(currentImageIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {/* Image Counter */}
                  {images.length > 1 && (
                    <div className="absolute top-2 left-2 bg-black/30 text-white text-xs px-2 py-1 rounded-full">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>

                {/* Thumbnail Navigation (optional for many images) */}
                {images.length > 1 && (
                  <div className="flex overflow-x-auto gap-2 mt-2 pb-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "relative w-13 h-13 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2",
                          idx === currentImageIndex ? "border-primary" : "border-transparent",
                        )}
                        onClick={() => setCurrentImageIndex(idx)}
                      >
                        <img
                          src={img.url || "/placeholder.svg"}
                          alt={`Thumbnail ${idx + 1}`}
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={triggerFileInput}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">Click to upload images</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF up to 10MB</p>
              </div>
            )}

            {images.length > 0 && (
              <Button variant="outline" size="sm" onClick={triggerFileInput} className="w-full mt-2">
                Add More Images
              </Button>
            )}
          </div>

          {/* Caption Input */}
          <div className="space-y-2">
            <label htmlFor="caption" className="text-sm font-medium">
              Caption
            </label>
            <Textarea
              id="caption"
              placeholder="Write a caption for your post..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={images.length === 0 || isSubmitting}>
            {isSubmitting ? "Sharing..." : "Share"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
