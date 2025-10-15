import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineEdit } from "react-icons/ai";
import ImageUpload from "./ImageUpload";
import { ImageType } from "@/lib/imageUploadUtils";
import { useAuthenticatedImage } from "@/hooks/useAuthenticatedImage";

type Props = {
  src: string | null;
  alt: string;
  onSave: (newImageUrl: string) => Promise<void>;
  fallback: React.ReactNode;
  circular?: boolean;
  borderThickness?: "normal" | "thick";
  userId: string;
  imageType: ImageType;
};

export default function EditableImage({
  src,
  onSave,
  fallback,
  circular = false,
  borderThickness = "normal",
  userId,
  imageType,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState(src || "");
  const [saving, setSaving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Use custom hook to handle authenticated image loading
  const displayUrl = useAuthenticatedImage(src, imageType);
  const previewUrl = useAuthenticatedImage(src, imageType);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset state when src changes
  useEffect(() => {
    // Only set imageUrl if it's an external URL, not a Supabase URL
    if (src && src.includes('.supabase.co/storage/')) {
      setImageUrl(""); // Clear the input for Supabase URLs
    } else {
      setImageUrl(src || "");
    }
  }, [src]);

  // Focus input when modal opens
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleCancel = useCallback(() => {
    setImageUrl(src || "");
    setIsEditing(false);
  }, [src]);

  // Handle modal close events
  useEffect(() => {
    if (!isEditing) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleCancel();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, handleCancel]);

  const handleSave = async () => {
    if (imageUrl === src) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(imageUrl);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving image: ", error);
      toast.error("Failed to update image");
      setImageUrl(src || "");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value);
  };

  const handleImageUploaded = async (url: string) => {
    // Auto-save uploaded images immediately
    setSaving(true);
    try {
      await onSave(url);
      setIsEditing(false);
      // Don't show toast here - let parent component handle success notification
    } catch (error) {
      console.error("Error saving uploaded image:", error);
      toast.error("Failed to save uploaded image");
    } finally {
      setSaving(false);
    }
  };

  const renderImagePreview = () => {
    // Show preview from previewUrl (authenticated blob) or imageUrl (manual URL input)
    const urlToShow = previewUrl || imageUrl;
    
    if (!urlToShow) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          {fallback}
        </div>
      );
    }
    return (
      <div
        className={`w-full h-full ${
          circular ? "rounded-full" : "rounded-lg"
        }`}
        style={{
          backgroundImage: `url("${urlToShow}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
    );
  };

  return (
    <>
      {/* Main Image Display */}
      <div
        className={`relative overflow-hidden w-48 h-48 ${
          circular ? "rounded-full" : "rounded-lg"
        } ${
          borderThickness === "thick"
            ? "border-gradient-thick"
            : "border-gradient"
        } shadow-lg`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`w-full h-full cursor-pointer ${
            circular ? "rounded-full" : "rounded-lg"
          }`}
          onClick={() => setIsEditing(true)}
          style={{
            backgroundImage: displayUrl ? `url("${displayUrl}")` : 'none',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            transform: "scale(1.02)",
          }}
        >
          {/* Show fallback if no src */}
          {!displayUrl && (
            <div className="w-full h-full flex items-center justify-center">
              {fallback}
            </div>
          )}
        </div>

        {/* Hover overlay with Edit icon */}
        {isHovered && (
          <div
            className={`absolute inset-0 bg-black flex items-center justify-center cursor-pointer transition-all duration-200 z-20 ${
              circular ? "rounded-full" : "rounded-lg"
            }`}
            onClick={() => setIsEditing(true)}
            style={{
              pointerEvents: "auto",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              transform: "scale(1.02)",
            }}
          >
            <div className="bg-gray-800 bg-opacity-90 rounded-full p-3 transform hover:scale-110 transition-transform">
              <AiOutlineEdit className="text-white" size={24} />
            </div>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {isEditing && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
          <div
            ref={modalRef}
            className="rounded-lg p-6 max-w-md w-full mx-4"
            style={{ background: "var(--gradient-card-subtle)" }}
          >
            <h3 className="text-lg text-gradient font-semibold mb-4">
              Update Image
            </h3>

            {/* Image Preview */}
            <div className="mb-4 flex justify-center">
              <div
                className={`w-32 h-32 border border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center ${
                  circular ? "rounded-full" : "rounded-lg"
                }`}
              >
                {renderImagePreview()}
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-4">
              <ImageUpload
                userId={userId}
                imageType={imageType}
                onImageSelected={handleImageUploaded}
              />
            </div>

            {/* Divider */}
            <div className="relative my-4 mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gradient text-gray-500">or</span>
                </div>
                <div className="w-full border-t border-gray-300"></div>
              </div>
            </div>

            {/* URL Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or paste an external image URL:
              </label>
              <input
                ref={inputRef}
                type="url"
                value={imageUrl}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
              <p className="text-xs text-gray-500 mt-1">
                For external images only. Uploaded images are managed automatically.
              </p>
            </div>

            {/* Clear option */}
            {imageUrl && (
              <div className="mb-4">
                <button
                  onClick={() => setImageUrl("")}
                  className="text-sm text-gray-500 hover:text-gray-700 underline cursor-pointer"
                >
                  Clear image
                </button>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md transition-colors flex items-center gap-2 cursor-pointer"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
