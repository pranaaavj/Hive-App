"use client"

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

  const calculateImageDisplay = (
    naturalWidth: number,
    naturalHeight: number,
    containerWidth: number,
    containerHeight: number,
  ) => {
    const imageRatio = naturalWidth / naturalHeight
    const containerRatio = containerWidth / containerHeight

    let displayWidth, displayHeight

    if (imageRatio > containerRatio) {
      displayHeight = containerHeight
      displayWidth = (naturalWidth * containerHeight) / naturalHeight
    } else {
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
            const containerWidth = 400
            const containerHeight = 500

            const { displayWidth, displayHeight } = calculateImageDisplay(
              img.width,
              img.height,
              containerWidth,
              containerHeight,
            )

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
              displayHeight,
            }

            setImages((prev) => [...prev, uploadedImage])
          }
          img.src = URL.createObjectURL(file)
        }
      })
    }
  }

  useEffect(() => {
    if (containerRef.current && images.length > 0) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width
      const containerHeight = containerRect.height

      setImages((prev) =>
        prev.map((img) => {
          const { displayWidth, displayHeight } = calculateImageDisplay(
            img.naturalWidth,
            img.naturalHeight,
            containerWidth,
            containerHeight,
          )

          const maxOffsetX = Math.max(0, displayWidth - containerWidth)
          const maxOffsetY = Math.max(0, displayHeight - containerHeight)

          return {
            ...img,
            displayWidth,
            displayHeight,
            offsetX: Math.min(img.offsetX, maxOffsetX),
            offsetY: Math.min(img.offsetY, maxOffsetY),
          }
        }),
      )
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

  const handleDragStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return

      setIsDragging(true)
      const currentImage = images[currentImageIndex]
      if (currentImage) {
        containerRef.current.dataset.startX = clientX.toString()
        containerRef.current.dataset.startY = clientY.toString()
        containerRef.current.dataset.initialOffsetX = currentImage.offsetX.toString()
        containerRef.current.dataset.initialOffsetY = currentImage.offsetY.toString()
      }
    },
    [images, currentImageIndex],
  )

  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || !containerRef.current) return

      const startX = Number.parseFloat(containerRef.current.dataset.startX || "0")
      const startY = Number.parseFloat(containerRef.current.dataset.startY || "0")
      const initialOffsetX = Number.parseFloat(containerRef.current.dataset.initialOffsetX || "0")
      const initialOffsetY = Number.parseFloat(containerRef.current.dataset.initialOffsetY || "0")

      const deltaX = clientX - startX
      const deltaY = clientY - startY

      const currentImage = images[currentImageIndex]
      if (!currentImage) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newOffsetX = initialOffsetX - deltaX
      const newOffsetY = initialOffsetY - deltaY

      const maxOffsetX = Math.max(0, currentImage.displayWidth - containerRect.width)
      const maxOffsetY = Math.max(0, currentImage.displayHeight - containerRect.height)

      const constrainedOffsetX = Math.max(0, Math.min(maxOffsetX, newOffsetX))
      const constrainedOffsetY = Math.max(0, Math.min(maxOffsetY, newOffsetY))

      setImages((prev) =>
        prev.map((img, idx) =>
          idx === currentImageIndex ? { ...img, offsetX: constrainedOffsetX, offsetY: constrainedOffsetY } : img,
        ),
      )
    },
    [isDragging, images, currentImageIndex],
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      handleDragStart(e.clientX, e.clientY)
    },
    [handleDragStart],
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      handleDragStart(touch.clientX, touch.clientY)
    },
    [handleDragStart],
  )

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
      document.addEventListener("mousemove", handleGlobalMouseMove)
      document.addEventListener("mouseup", handleGlobalMouseUp)
      document.addEventListener("touchmove", handleGlobalTouchMove, { passive: false })
      document.addEventListener("touchend", handleGlobalTouchEnd)
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove)
      document.removeEventListener("mouseup", handleGlobalMouseUp)
      document.removeEventListener("touchmove", handleGlobalTouchMove)
      document.removeEventListener("touchend", handleGlobalTouchEnd)
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const uploadedUrls: string[] = []

      for (const img of images) {
        const url = await updloadToCloudinary(img.file)
        if (url) {
          uploadedUrls.push(url)
        }
      }

      await addPost({ images: uploadedUrls, caption })
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
  const canDrag =
    currentImage &&
    containerRef.current &&
    (currentImage.displayWidth > containerRef.current.getBoundingClientRect().width ||
      currentImage.displayHeight > containerRef.current.getBoundingClientRect().height)

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen)
        if (!newOpen) resetForm()
      }}
    >
      <DialogContent className="sm:max-w-[330px] max-h-[95vh] overflow-y-auto w-[90vw] max-w-[320px] lg:max-w-[330px]">
        <DialogHeader>
          <DialogTitle className="text-base lg:text-lg">Create New Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 my-4">
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
                <div
                  ref={containerRef}
                  className="relative w-full bg-muted rounded-md overflow-hidden select-none"
                  style={{ aspectRatio: "4/5" }}
                >
                  {currentImage && (
                    <div
                      className={cn(
                        "w-full h-full relative overflow-hidden",
                        canDrag && (isDragging ? "cursor-grabbing" : "cursor-grab"),
                      )}
                      onMouseDown={canDrag ? handleMouseDown : undefined}
                      onTouchStart={canDrag ? handleTouchStart : undefined}
                      style={{ userSelect: "none" }}
                    >
                      <img
                        ref={imageRef}
                        src={currentImage.url || "/placeholder.svg"}
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
                      {canDrag && !isDragging && (
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 pointer-events-none">
                          <Move className="h-3 w-3" />
                          <span className="hidden sm:inline">Drag to reposition</span>
                          <span className="sm:hidden">Drag</span>
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
                        className="absolute left-1 lg:left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full z-10 h-8 w-8 lg:h-10 lg:w-10"
                        onClick={handlePrevImage}
                        disabled={currentImageIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4 lg:h-6 lg:w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 lg:right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full z-10 h-8 w-8 lg:h-10 lg:w-10"
                        onClick={handleNextImage}
                        disabled={currentImageIndex === images.length - 1}
                      >
                        <ChevronRight className="h-4 w-4 lg:h-6 lg:w-6" />
                      </Button>
                    </>
                  )}

                  {/* Remove Image Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 lg:right-2 top-1 lg:top-2 bg-black/30 hover:bg-black/50 text-white rounded-full z-10 h-8 w-8 lg:h-10 lg:w-10"
                    onClick={() => removeImage(currentImageIndex)}
                  >
                    <X className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>

                  {/* Image Counter */}
                  {images.length > 1 && (
                    <div className="absolute top-1 lg:top-2 left-1 lg:left-2 bg-black/30 text-white text-xs px-2 py-1 rounded-full z-10">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>

                {/* Thumbnail Navigation */}
                {images.length > 1 && (
                  <div className="flex overflow-x-auto gap-1 lg:gap-2 mt-2 pb-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "relative flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2",
                          "w-10 h-12 lg:w-12 lg:h-15",
                          idx === currentImageIndex ? "border-primary" : "border-transparent",
                        )}
                        onClick={() => setCurrentImageIndex(idx)}
                      >
                        <img
                          src={img.url || "/placeholder.svg"}
                          alt={`Thumbnail ${idx + 1}`}
                          className="absolute"
                          style={{
                            width: `${(img.displayWidth / img.displayWidth) * (window.innerWidth < 1024 ? 40 : 48)}px`,
                            height: `${(img.displayHeight / img.displayHeight) * (window.innerWidth < 1024 ? 48 : 60)}px`,
                            left: `-${(img.offsetX / img.displayWidth) * (window.innerWidth < 1024 ? 40 : 48)}px`,
                            top: `-${(img.offsetY / img.displayHeight) * (window.innerWidth < 1024 ? 48 : 60)}px`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-md p-4 lg:p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                style={{ aspectRatio: "4/5" }}
                onClick={triggerFileInput}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <Upload className="h-8 w-8 lg:h-12 lg:w-12 text-muted-foreground mb-2 lg:mb-3" />
                  <p className="text-xs lg:text-sm font-medium">Click to upload images</p>
                  <p className="text-xs text-muted-foreground mt-1 hidden lg:block">JPG, PNG, GIF up to 10MB</p>
                  <p className="text-xs text-muted-foreground mt-1 hidden lg:block">
                    Images will be cropped to 4:5 ratio
                  </p>
                </div>
              </div>
            )}

            {images.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={triggerFileInput}
                className="w-full mt-2 bg-transparent text-xs lg:text-sm h-8 lg:h-auto"
              >
                Add More Images
              </Button>
            )}
          </div>

          {/* Caption Input */}
          <div className="space-y-2">
            <label htmlFor="caption" className="text-xs lg:text-sm font-medium">
              Caption
            </label>
            <Textarea
              id="caption"
              placeholder="Write a caption for your post..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="resize-none text-xs lg:text-sm"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-xs lg:text-sm h-8 lg:h-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={images.length === 0 || isSubmitting}
            className="w-full sm:w-auto text-xs lg:text-sm h-8 lg:h-auto"
          >
            {isSubmitting ? "Sharing..." : "Share"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
