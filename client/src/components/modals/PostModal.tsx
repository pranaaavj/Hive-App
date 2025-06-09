import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, Upload, Move } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useAddPostMutation } from "@/services/authApi"
import { updloadToCloudinary } from "@/utils/cloudinary"

interface UploadedImage {
  url: string
  file: File
  offsetX: number
  offsetY: number
  naturalWidth: number
  naturalHeight: number
  displayWidth: number
  displayHeight: number
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
  const [isDragging, setIsDragging] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [addPost] = useAddPostMutation()

  // Calculate how the image should be displayed in the 4:5 container
  const calculateImageDisplay = (naturalWidth: number, naturalHeight: number, containerWidth: number, containerHeight: number) => {
    const imageRatio = naturalWidth / naturalHeight
    const containerRatio = containerWidth / containerHeight
    
    let displayWidth, displayHeight
    
    if (imageRatio > containerRatio) {
      // Image is wider - fit by height
      displayHeight = containerHeight
      displayWidth = (naturalWidth * containerHeight) / naturalHeight
    } else {
      // Image is taller - fit by width
      displayWidth = containerWidth
      displayHeight = (naturalHeight * containerWidth) / naturalWidth
    }
    
    return { displayWidth, displayHeight }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const img = new Image()
          img.onload = () => {
            // Get container dimensions (assuming 4:5 ratio with 400px width)
            const containerWidth = 400
            const containerHeight = 500
            
            const { displayWidth, displayHeight } = calculateImageDisplay(
              img.width, 
              img.height, 
              containerWidth, 
              containerHeight
            )
            
            // Center the image initially
            const initialOffsetX = Math.max(0, (displayWidth - containerWidth) / 2)
            const initialOffsetY = Math.max(0, (displayHeight - containerHeight) / 2)
            
            const uploadedImage: UploadedImage = {
              url: URL.createObjectURL(file),
              file: file,
              offsetX: initialOffsetX,
              offsetY: initialOffsetY,
              naturalWidth: img.width,
              naturalHeight: img.height,
              displayWidth,
              displayHeight
            }
            
            setImages(prev => [...prev, uploadedImage])
          }
          img.src = URL.createObjectURL(file)
        }
      })
    }
  }

  // Update display dimensions when container size changes
  useEffect(() => {
    if (containerRef.current && images.length > 0) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width
      const containerHeight = containerRect.height
      
      setImages(prev => prev.map(img => {
        const { displayWidth, displayHeight } = calculateImageDisplay(
          img.naturalWidth,
          img.naturalHeight,
          containerWidth,
          containerHeight
        )
        
        // Adjust offsets to stay within bounds
        const maxOffsetX = Math.max(0, displayWidth - containerWidth)
        const maxOffsetY = Math.max(0, displayHeight - containerHeight)
        
        return {
          ...img,
          displayWidth,
          displayHeight,
          offsetX: Math.min(img.offsetX, maxOffsetX),
          offsetY: Math.min(img.offsetY, maxOffsetY)
        }
      }))
    }
  }, [images.length])

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

  // Unified drag handler for both mouse and touch
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return
    
    setIsDragging(true)
    const containerRect = containerRef.current.getBoundingClientRect()
    
    // Store initial mouse position and current image offset
    const currentImage = images[currentImageIndex]
    if (currentImage) {
      containerRef.current.dataset.startX = clientX.toString()
      containerRef.current.dataset.startY = clientY.toString()
      containerRef.current.dataset.initialOffsetX = currentImage.offsetX.toString()
      containerRef.current.dataset.initialOffsetY = currentImage.offsetY.toString()
    }
  }, [images, currentImageIndex])

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !containerRef.current) return

    const startX = parseFloat(containerRef.current.dataset.startX || '0')
    const startY = parseFloat(containerRef.current.dataset.startY || '0')
    const initialOffsetX = parseFloat(containerRef.current.dataset.initialOffsetX || '0')
    const initialOffsetY = parseFloat(containerRef.current.dataset.initialOffsetY || '0')

    const deltaX = clientX - startX
    const deltaY = clientY - startY

    const currentImage = images[currentImageIndex]
    if (!currentImage) return

    const containerRect = containerRef.current.getBoundingClientRect()
    
    // Calculate new offsets
    const newOffsetX = initialOffsetX - deltaX
    const newOffsetY = initialOffsetY - deltaY
    
    // Constrain offsets within bounds
    const maxOffsetX = Math.max(0, currentImage.displayWidth - containerRect.width)
    const maxOffsetY = Math.max(0, currentImage.displayHeight - containerRect.height)
    
    const constrainedOffsetX = Math.max(0, Math.min(maxOffsetX, newOffsetX))
    const constrainedOffsetY = Math.max(0, Math.min(maxOffsetY, newOffsetY))

    setImages(prev => prev.map((img, idx) => 
      idx === currentImageIndex 
        ? { ...img, offsetX: constrainedOffsetX, offsetY: constrainedOffsetY }
        : img
    ))
  }, [isDragging, images, currentImageIndex])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    handleDragStart(e.clientX, e.clientY)
  }, [handleDragStart])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY)
  }, [handleDragMove])

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleDragStart(touch.clientX, touch.clientY)
  }, [handleDragStart])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleDragMove(touch.clientX, touch.clientY)
  }, [handleDragMove])

  // Global event listeners for mouse up/move
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleDragMove(e.clientX, e.clientY)
      }
    }

    const handleGlobalMouseUp = () => {
      handleDragEnd()
    }

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const handleGlobalTouchEnd = () => {
      handleDragEnd()
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
      document.addEventListener('touchend', handleGlobalTouchEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('touchmove', handleGlobalTouchMove)
      document.removeEventListener('touchend', handleGlobalTouchEnd)
    }
  }, [isDragging, handleDragMove, handleDragEnd])

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
      console.log(uploadedUrls, caption)
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
    images.forEach((img) => URL.revokeObjectURL(img.url))
    setImages([])
    setCaption("")
    setCurrentImageIndex(0)
    setIsDragging(false)
  }

  const currentImage = images[currentImageIndex]
  const canDrag = currentImage && containerRef.current && (
    currentImage.displayWidth > containerRef.current.getBoundingClientRect().width ||
    currentImage.displayHeight > containerRef.current.getBoundingClientRect().height
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen)
        if (!newOpen) resetForm()
      }}
    >
      <DialogContent className="sm:max-w-[330px] max-h-[95vh] overflow-y-auto">
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
                {/* Fixed 4:5 aspect ratio container */}
                <div 
                  ref={containerRef}
                  className="relative w-full bg-muted rounded-md overflow-hidden select-none"
                  style={{ aspectRatio: "4/5" }}
                >
                  {currentImage && (
                    <div
                      className={cn(
                        "w-full h-full relative overflow-hidden",
                        canDrag && (isDragging ? "cursor-grabbing" : "cursor-grab")
                      )}
                      onMouseDown={canDrag ? handleMouseDown : undefined}
                      onTouchStart={canDrag ? handleTouchStart : undefined}
                      style={{ userSelect: 'none' }}
                    >
                      <img
                        ref={imageRef}
                        src={currentImage.url}
                        alt={`Preview ${currentImageIndex + 1}`}
                        className="absolute select-none pointer-events-none"
                        style={{
                          width: `${currentImage.displayWidth}px`,
                          height: `${currentImage.displayHeight}px`,
                          left: `-${currentImage.offsetX}px`,
                          top: `-${currentImage.offsetY}px`,
                        }}
                        draggable={false}
                      />
                      
                      {/* Drag indicator */}
                      {canDrag && !isDragging && (
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 pointer-events-none">
                          <Move className="h-3 w-3" />
                          Drag to reposition
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation Controls */}
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full z-10"
                        onClick={handlePrevImage}
                        disabled={currentImageIndex === 0}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full z-10"
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
                    className="absolute right-2 top-2 bg-black/30 hover:bg-black/50 text-white rounded-full z-10"
                    onClick={() => removeImage(currentImageIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {/* Image Counter */}
                  {images.length > 1 && (
                    <div className="absolute top-2 left-2 bg-black/30 text-white text-xs px-2 py-1 rounded-full z-10">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>

                {/* Thumbnail Navigation */}
                {images.length > 1 && (
                  <div className="flex overflow-x-auto gap-2 mt-2 pb-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "relative flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2",
                          "w-12 h-15", // 4:5 aspect ratio for thumbnails
                          idx === currentImageIndex ? "border-primary" : "border-transparent",
                        )}
                        onClick={() => setCurrentImageIndex(idx)}
                      >
                        <img
                          src={img.url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="absolute"
                          style={{
                            width: `${(img.displayWidth / img.displayWidth) * 48}px`,
                            height: `${(img.displayHeight / img.displayHeight) * 60}px`,
                            left: `-${(img.offsetX / img.displayWidth) * 48}px`,
                            top: `-${(img.offsetY / img.displayHeight) * 60}px`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                style={{ aspectRatio: "4/5" }}
                onClick={triggerFileInput}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Click to upload images</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF up to 10MB</p>
                  <p className="text-xs text-muted-foreground mt-1">Images will be cropped to 4:5 ratio</p>
                </div>
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