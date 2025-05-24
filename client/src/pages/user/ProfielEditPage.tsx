import type React from "react";
import { useEffect, useRef, useState, } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Check, X, Loader2 } from "lucide-react";
import { useGetProfileDetailsQuery, useUpadateProfileMutation } from "@/services/authApi";
import { useNavigate, useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageCropper } from "@/components/ImageCropper";
import { updloadToCloudinary } from "@/utils/cloudinary";


export function ProfileEditPage() {
  const {userId} = useParams()  
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {data: profile, isLoading} = useGetProfileDetailsQuery(userId)
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || '',
  });
  const [upadateProfile] = useUpadateProfileMutation()

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [previewUrl, profileImagePreview]);

  // This function would open your existing modal
  const openImageUploadModal = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setIsUploadModalOpen(true);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (file: File) => {
    setCroppedImage(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveImage = async() => {
    if(!croppedImage) return;

    const previewURL = URL.createObjectURL(croppedImage);
    setProfileImagePreview(previewURL);
    
    setIsUploadModalOpen(false);
    setSelectedImage(null);
  }

  const handleCancelUpload = () => {
    setSelectedImage(null);
    setCroppedImage(null);
    setIsUploadModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let profilePictureUrl = profile?.profilePicture || '';
      if (croppedImage) {
        const uploadedUrl = await updloadToCloudinary(croppedImage);
        if (uploadedUrl) {
          profilePictureUrl = uploadedUrl;
        } else {
          throw new Error('Failed to upload image - received null URL');
        }
      }

      const updatedData = {
        username: formData.username,
        bio: formData.bio,
        profilePicture: profilePictureUrl,
      };

    await upadateProfile(updatedData).unwrap()
    setCroppedImage(null);
    if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profileImagePreview);
      setProfileImagePreview(null);
    }
    navigate(`/profile/${userId}`)

    } catch (error) {
      console.error('Error saving profile:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentProfileImage = () => {
    if (profileImagePreview) {
      return profileImagePreview;
    }
    return profile?.profilePicture || "/placeholder.svg";
  };

  return (
    <div className="container max-w-4xl py-2 mx-auto">
      <div className="relative flex items-center justify-between mb-5">
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold">
          Edit Profile
        </h1>

        <div className="flex gap-4 ml-auto">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Update your profile picture. This will be displayed on your
                profile and in comments.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border">
                  <AvatarImage
                    src={getCurrentProfileImage()}
                    alt={profile?.name}
                  />
                  <AvatarFallback>{profile?.username?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
                  type="button"
                  onClick={openImageUploadModal}
                >
                  <Camera className="w-4 h-4" />
                  <span className="sr-only">Change profile picture</span>
                </Button>
                {profileImagePreview && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="font-medium">Upload a new photo</h3>
                <p className="text-sm text-muted-foreground">
                  Your photo should be in JPEG or PNG format, under 2MB.
                </p>
                {profileImagePreview && (
                  <p className="text-sm text-green-600 font-medium">
                    New image ready to upload
                  </p>
                )}
                <Button
                  variant="outline"
                  type="button"
                  onClick={openImageUploadModal}
                >
                  Change Photo
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information. This information will be
                displayed publicly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid ">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                  {formData.bio?.length || 0}/160 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex flex-col items-center space-y-4">
              <ImageCropper
                image={selectedImage}
                onCropComplete={handleCropComplete}
              />
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
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Save Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}