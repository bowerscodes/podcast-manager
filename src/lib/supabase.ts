import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Check if a URL is from the current storage provider (Supabase Storage)
 * Use this to determine if an image is managed by your app vs. an external URL
 */
export function isStorageProviderUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  // Check if URL matches your Supabase Storage domain
  // This makes it easy to switch providers - just update NEXT_PUBLIC_SUPABASE_URL
  const storagePattern = `${supabaseUrl}/storage/`;
  return url.includes(storagePattern);
}
