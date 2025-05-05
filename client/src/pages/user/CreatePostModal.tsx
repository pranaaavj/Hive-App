'use client'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner' // or 'react-hot-toast' if you're using that

type CreatePostModalProps = {
    open: boolean
    setOpen: (val: boolean) => void
  }
export function CreatePostModal({open,setOpen}:CreatePostModalProps) {
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  const resetForm = () => {
    setCaption('')
    setFile(null)
    setPreview(null)
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)

    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', 'YOUR_UPLOAD_PRESET')
    data.append('cloud_name', 'YOUR_CLOUD_NAME')

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
        method: 'POST',
        body: data,
      })
      const cloudRes = await res.json()
      const imageUrl = cloudRes.secure_url

      console.log({ caption, imageUrl })

      toast.success('Image uploaded successfully')
      resetForm()
      setOpen(false) // ✅ this properly closes the modal
    } catch (err) {
      toast.error('Image Upload failed')
      console.error('Upload failed', err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(state) => {
      setOpen(state)
      if (!state) resetForm() // reset form when modal is closed
    }}>
      <DialogTrigger asChild>
        <Button variant="default" className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Input type="file" accept="image/*,video/*" onChange={handleFileChange} />
          {preview && (
            <div className="w-full">
              {file?.type.startsWith('video') ? (
                <video src={preview} controls className="w-full rounded-lg" />
              ) : (
                <img src={preview} alt="preview" className="w-full rounded-lg" />
              )}
            </div>
          )}
          <Textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleUpload} disabled={isUploading || !file}>
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
