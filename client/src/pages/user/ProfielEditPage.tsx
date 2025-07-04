"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Check, X, Loader2, ArrowLeft } from "lucide-react"
import { useGetProfileDetailsQuery, useUpadateProfileMutation } from "@/services/authApi"
import { useNavigate, useParams } from "react-router-dom"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImageCropper } from "@/components/ImageCropper"
import { updloadToCloudinary } from "@/utils/cloudinary"
import { setProfilePicture } from "@/redux/slices/userSlice"
import { useDispatch } from "react-redux"

export function ProfileEditPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [croppedImage, setCroppedImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [previewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dispatch = useDispatch()

  const { data: profile, isLoading } = useGetProfileDetailsQuery(userId)
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    bio: profile?.bio || "",
  })

  const [upadateProfile] = useUpadateProfileMutation()

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        bio: profile.bio || "",
      })
    }
  }, [profile])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      if (profileImagePreview && profileImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(profileImagePreview)
      }
    }
  }, [previewUrl, profileImagePreview])

  const openImageUploadModal = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        setSelectedImage(reader.result as string)
        setIsUploadModalOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (file: File) => {
    setCroppedImage(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveImage = async () => {
    if (!croppedImage) return

    const previewURL = URL.createObjectURL(croppedImage)
    setProfileImagePreview(previewURL)
    setIsUploadModalOpen(false)
    setSelectedImage(null)
  }

  const handleCancelUpload = () => {
    setSelectedImage(null)
    setCroppedImage(null)
    setIsUploadModalOpen(false)
  }

  const handleCancel = () => {
    navigate(`/profile/${userId}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let profilePictureUrl = profile?.profilePicture || ""

      if (croppedImage) {
        const uploadedUrl = await updloadToCloudinary(croppedImage)
        if (uploadedUrl) {
          profilePictureUrl = uploadedUrl
        } else {
          throw new Error("Failed to upload image - received null URL")
        }
      }

      const updatedData = {
        username: formData.username,
        bio: formData.bio,
        profilePicture: profilePictureUrl,
      }

      const updatedProfile = await upadateProfile(updatedData).unwrap()
      console.log(updatedProfile, "updatedProfile")

      dispatch(setProfilePicture(updatedProfile.profile.profilePicture))

      setCroppedImage(null)
      if (profileImagePreview && profileImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(profileImagePreview)
        setProfileImagePreview(null)
      }

      navigate(`/profile/${userId}`)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCurrentProfileImage = () => {
    if (profileImagePreview) {
      return profileImagePreview
    }
    return profile?.profilePicture || "/placeholder.svg"
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile back button */}
            <Button variant="ghost" size="sm" onClick={handleCancel} className="lg:hidden p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex-1 text-center lg:text-left">
              Edit Profile
            </h1>

            <div className="flex gap-2 sm:gap-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="hidden lg:flex bg-white hover:bg-gray-50 border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Profile Picture Card */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Profile Picture</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Update your profile picture. This will be displayed on your profile and in comments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-gray-100 shadow-lg">
                    <AvatarImage src={getCurrentProfileImage() || "/placeholder.svg"} alt={profile?.username} />
                    <AvatarFallback className="text-xl sm:text-2xl font-semibold">
                      {profile?.username?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 shadow-lg bg-white hover:bg-gray-50 border-2 border-gray-200"
                    type="button"
                    onClick={openImageUploadModal}
                  >
                    <Camera className="w-5 h-5" />
                    <span className="sr-only">Change profile picture</span>
                  </Button>
                  {profileImagePreview && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                  )}
                </div>

                {/* Upload Info */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <h3 className="font-semibold text-gray-900">Upload a new photo</h3>
                  <p className="text-sm text-gray-600">Your photo should be in JPEG or PNG format, under 2MB.</p>
                  {profileImagePreview && (
                    <p className="text-sm text-green-600 font-medium">New image ready to upload</p>
                  )}
                  <Button
                    variant="outline"
                    type="button"
                    onClick={openImageUploadModal}
                    className="bg-white hover:bg-gray-50 border-gray-300"
                  >
                    Change Photo
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Card */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Update your personal information. This information will be displayed publicly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  placeholder="Enter your username"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  className="min-h-[120px] bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500 resize-none"
                  maxLength={160}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">Share a bit about yourself with others</p>
                  <p className="text-xs text-gray-500">{formData.bio?.length || 0}/160 characters</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Save Button */}
          <div className="lg:hidden">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-sm h-12"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Image Crop Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex flex-col items-center space-y-4">
              <ImageCropper image={selectedImage} onCropComplete={handleCropComplete} />
            </div>
          )}
          <DialogFooter className="flex justify-between sm:justify-end gap-2">
            <Button variant="outline" onClick={handleCancelUpload}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveImage}
              disabled={!croppedImage}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Check className="h-4 w-4 mr-2" />
              Save Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
