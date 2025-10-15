import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Custom hook to load images from Supabase Storage with authentication
 * Handles private buckets (avatars) with auth, public buckets (artwork), and external URLs
 * 
 * @param src - Image URL (Supabase Storage or external)
 * @param imageType - Type of image ('avatar' or 'artwork') to determine bucket and access method
 * @returns Blob URL for private authenticated images, or direct URL for public/external images
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

    // Check if it's a Supabase Storage URL
    const isSupabaseUrl = src.includes('.supabase.co/storage/');
    
    if (!isSupabaseUrl) {
      // External URL, use directly
      setBlobUrl(src);
      return;
    }

    // It's a Supabase URL - handle based on bucket type
    if (imageType === 'artwork') {
      // Artwork bucket is public - use URL directly for better performance
      setBlobUrl(src);
      return;
    }

    // Avatars bucket is private - download with authentication
    if (imageType === 'avatar') {
      let mounted = true;
      let currentBlobUrl: string | null = null;

      async function loadAuthenticatedImage() {
        try {
          const bucket = 'avatars';
          
          // Extract the file path from the URL
          const urlParts = src!.split(`${bucket}/`);
          if (urlParts.length < 2) {
            console.error('Invalid Supabase avatar URL format:', src);
            if (mounted) setBlobUrl(src ?? null); // Fallback
            return;
          }
          
          const filePath = urlParts[1];

          const { data, error } = await supabase.storage
            .from(bucket)
            .download(filePath);

          if (error) {
            console.error('Error downloading avatar:', error);
            if (mounted) setBlobUrl(src ?? null); // Fallback
            return;
          }

          // Create blob URL
          const blob = URL.createObjectURL(data);
          currentBlobUrl = blob;
          if (mounted) setBlobUrl(blob);
        } catch (error) {
          console.error('Error loading authenticated avatar:', error);
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
    }
  }, [src, imageType]);

  return blobUrl;
}
