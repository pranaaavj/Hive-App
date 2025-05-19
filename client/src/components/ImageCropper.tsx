"use client"

import { useState, useRef, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

interface ImageCropperProps {
  image: string
  onCropComplete: (file: File) => void
}

// This function creates a centered crop with a specific aspect ratio
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export function ImageCropper({ image, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const img = new Image()
    img.src = image
    img.onload = () => {
      const { naturalWidth: width, naturalHeight: height } = img
      setCrop(centerAspectCrop(width, height, 1))
    }
  }, [image])

  useEffect(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return

    const img = imgRef.current
    const canvas = previewCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cropWidth = completedCrop.width
    const cropHeight = completedCrop.height
    const cropX = completedCrop.x
    const cropY = completedCrop.y

    const size = Math.min(cropWidth, cropHeight)
    const outputSize = 300
    canvas.width = outputSize
    canvas.height = outputSize

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.beginPath()
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
    ctx.clip()

    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height

    const sourceX = cropX * scaleX
    const sourceY = cropY * scaleY
    const sourceWidth = cropWidth * scaleX
    const sourceHeight = cropHeight * scaleY

    if (rotate !== 0) {
      ctx.translate(outputSize / 2, outputSize / 2)
      ctx.rotate((rotate * Math.PI) / 180)
      ctx.translate(-outputSize / 2, -outputSize / 2)
    }

    ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputSize, outputSize)
    ctx.restore()
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "cropped-image.png", { type: "image/png" })
        onCropComplete(file)
      }
    }, "image/png")
  }, [completedCrop, scale, rotate, onCropComplete])

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="relative max-w-full max-h-[300px] overflow-hidden">
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={1}
          circularCrop
          className="max-h-[300px]"
        >
          <img
            ref={imgRef}
            src={image || "/placeholder.svg"}
            alt="Crop me"
            style={{
              transform: `scale(${scale}) rotate(${rotate}deg)`,
              maxHeight: "300px",
              width: "auto",
            }}
            crossOrigin="anonymous"
          />
        </ReactCrop>
      </div>

      <div className="w-full space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Zoom</label>
          <Slider
            value={[scale]}
            min={0.5}
            max={2}
            step={0.01}
            onValueChange={(value) => setScale(value[0])}
            className="w-full"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Rotate</label>
          <Slider
            value={[rotate]}
            min={0}
            max={360}
            step={1}
            onValueChange={(value) => setRotate(value[0])}
            className="w-full"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <div className="relative w-[150px] h-[150px] rounded-full overflow-hidden border-2 border-violet-300">
          <canvas
            ref={previewCanvasRef}
            className="w-full h-full object-cover"
            style={{ display: completedCrop ? "block" : "none" }}
          />
          {!completedCrop && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
              Preview
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
