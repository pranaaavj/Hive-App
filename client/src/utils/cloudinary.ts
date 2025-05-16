import axios from "axios"

export const updloadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", import.meta.env.VITE_PRESET_NAME)

    try {
        console.log("Cloud:", import.meta.env.VITE_CLOUD_NAME)
console.log("Preset:", import.meta.env.VITE_PRESET_NAME)
console.log("File:", file)
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
    
        return response.data.secure_url
      } catch (error) {
        console.error('Cloudinary Upload Error:', error)
        return null
      }
    }