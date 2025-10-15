import { supabase } from "./supabase";

export type ImageType = "avatar" | "artwork";

export async function uploadImage(
  file: File,
  userId: string,
  imageType: ImageType
): Promise<{ url: string; error: string | null}> {
  try {
    const bucket = imageType === "avatar" ? "avatars" : "artwork";

    // For avatars: use simple userId-based naming (one avatar per user)
    // For artwork: use timestamp for multiple images
    const fileExt = file.name.split('.').pop();
    const fileName = imageType === "avatar" 
      ? `${userId}.${fileExt}`
      : `${userId}-${Date.now()}.${fileExt}`;

    // Upload the image to Supabase Storage
    // For avatars, upsert=true will replace existing avatar
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: imageType === "avatar" // Replace existing avatar, but not artwork
      });

    if (error) {
      console.error("Error uploading image:", error);
      return { url: "", error: error.message };
    }

    // Get the public URL of the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error("Unexpected error uploading image:", error);
    return { url: "", error: "Unexpected error uploading image" };
  }
};

export async function deleteImage(
  imageUrl: string,
  imageType: ImageType
): Promise<{ success: boolean; error: string | null }> {
  try {
    const bucket = imageType === "avatar" ? "avatars" : "artwork";

    // Extract the file path from the URL
    const urlParts = imageUrl.split(`${bucket}/`);
    if (urlParts.length < 2) {
      return { success: false, error: "Invalid image URL" };
    }
    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error("Error deleting image:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Unexpected error deleting image:", error);
    return { success: false, error: "Unexpected error deleting image" };
  }
}
