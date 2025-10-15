"use client";

import { ImageType, uploadImage } from "@/lib/imageUploadUtils";
import { Button } from "@heroui/button";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaCamera } from "react-icons/fa";


type ImageUploadProps = {
  userId: string;
  imageType: ImageType;
  onImageSelected: (url: string) => void;
}

export default function ImageUpload({
  userId,
  imageType,
  onImageSelected,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    // Validate file size (1MB max)
    if (file.size > 1 * 1024 * 1024) { 
      toast.error("Image size must be less than 1MB.");
      return;
    }

    setIsUploading(true);
    try {
      const { url, error } = await uploadImage(file, userId, imageType);
      
      if (error) {
        toast.error(error);
        return;
      }

      onImageSelected(url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error uploading image. Please try again.");
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Button
        size="sm"
        color="primary"
        onPress={() => imageInputRef.current?.click()}
        isLoading={isUploading}
        fullWidth
      >
        {isUploading 
          ? "Uploading..." 
          : <span className="flex items-center justify-center gap-2"><FaCamera /> Choose File to Upload</span>}
      </Button>
    </div>
  )
};
