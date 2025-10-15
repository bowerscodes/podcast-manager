import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Custom hook to load images from Supabase Storage with authentication
 * Handles both private Supabase bucket URLs and external URLs
 * 
 * @param src - Image URL (Supabase Storage or external)
 * @param imageType - Type of image ('avatar' or 'artwork') to determine bucket
 * @returns Blob URL for authenticated Supabase images, or original URL for external images
 */
export function useAuthenticatedImage(
  src: string | null | undefined,
  imageType: 'avatar' | 'artwork' = 'avatar'
): string | null {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setBlobUrl(null);
      return;
    }

    // If it's a Supabase Storage URL, download with auth
    if (src.includes('.supabase.co/storage/')) {
      let mounted = true;
      let currentBlobUrl: string | null = null;

      async function loadAuthenticatedImage() {
        try {
          const bucket = imageType === 'avatar' ? 'avatars' : 'artwork';
          
          // Extract the file path from the URL
          const urlParts = src!.split(`${bucket}/`);
          if (urlParts.length < 2) {
            console.error('Invalid Supabase URL format');
            if (mounted) setBlobUrl(src ?? null); // Fallback
            return;
          }
          
          const filePath = urlParts[1];

          const { data, error } = await supabase.storage
            .from(bucket)
            .download(filePath);

          if (error) {
            console.error('Error downloading image:', error);
            if (mounted) setBlobUrl(src ?? null); // Fallback
            return;
          }

          // Create blob URL
          const blob = URL.createObjectURL(data);
          currentBlobUrl = blob;
          if (mounted) setBlobUrl(blob);
        } catch (error) {
          console.error('Error loading authenticated image:', error);
          if (mounted) setBlobUrl(src ?? null); // Fallback
        }
      }

      loadAuthenticatedImage();

      // Cleanup function to revoke blob URL
      return () => {
        mounted = false;
        if (currentBlobUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(currentBlobUrl);
        }
      };
    } else {
      // External URL, use directly
      setBlobUrl(src);
    }
  }, [src, imageType]);

  return blobUrl;
}
