import { useCallback, useEffect, useRef, useState } from "react";
import { Image } from "@heroui/image";
import toast from "react-hot-toast";
import { AiOutlineEdit } from "react-icons/ai";

type Props = {
  src: string | null;
  alt: string;
  onSave: (newImageUrl: string) => Promise<void>;
  fallback: React.ReactNode;
  className: string;
};

export default function EditableImage({
  src,
  alt,
  onSave,
  fallback,
  className = "",
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState(src || "");
  const [saving, setSaving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset state when src changes
  useEffect(() => {
    setImageUrl(src || "");
    setImageError(false);
  }, [src]);

  // Focus input when modal opens
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleCancel = useCallback(() => {
    setImageUrl(src || "");
    setImageError(false);
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
      toast.success("Image updated successfully");
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
    setImageError(false);
  };

  const renderImagePreview = () => {
    if (!imageUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="scale-50">{fallback}</div>
        </div>
      );
    }
    if (imageError) {
      return (
        <div className="w-full h-full flex items-center justify-center text-red-400">
          <div className="text-sm">Invalid URL</div>
        </div>
      );
    }
    return (
      <>
        <Image
          src={imageUrl}
          alt={alt}
          className="hidden"
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
        <div
          className="w-full h-full rounded-lg"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </>
    );
  };

  return (
    <>
      {/* Main Image Display */}
      <div
        className="relative inline-block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {src ? (
          <div className={`relative p-0.5 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 ${className}`}>
            <Image
              src={src}
              alt={alt}
              className="w-48 h-48 rounded-lg object-cover cursor-pointer"
              onClick={() => setIsEditing(true)}
            />
          </div>
        ) : (
          <div className={`relative p-0.5 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 ${className}`}>
            <div
              className="w-48 h-48 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              {fallback}
            </div>
          </div>
        )}

        {/* Hover overlay with Edit icon */}
        {isHovered && (
          <div
            className="absolute inset-0.5 bg-black rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 z-20"
            onClick={() => setIsEditing(true)}
            style={{
              pointerEvents: "auto",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
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
              <div className="w-32 h-32 rounded-lg border border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
                {renderImagePreview()}
              </div>
            </div>

            {/* URL Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                ref={inputRef}
                type="url"
                value={imageUrl}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter image URL..."
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
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
