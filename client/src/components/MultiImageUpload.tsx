import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";

interface MultiImageUploadProps {
  label: string;
  currentImages?: string[]; // Array of image URLs
  maxImages?: number;
  maxSizeMB?: number;
  onImagesChange: (imageUrls: string[]) => void;
  errorMessage?: string | null;
}

export function MultiImageUpload({
  label,
  currentImages = [],
  maxImages = 5,
  maxSizeMB = 5,
  onImagesChange,
  errorMessage,
}: MultiImageUploadProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(currentImages);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadMutation = trpc.upload.image.useMutation();

  // Sync internal state with prop on mount only
  useEffect(() => {
    setImageUrls(currentImages);
  }, []); // Only run on mount

  // Update parent when images change (but not on initial render)
  useEffect(() => {
    // Only call onImagesChange if imageUrls is different from currentImages
    const isDifferent = JSON.stringify(imageUrls) !== JSON.stringify(currentImages);
    if (isDifferent) {
      onImagesChange(imageUrls);
    }
  }, [imageUrls]); // Remove onImagesChange from dependencies to prevent loop

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed max images
    if (imageUrls.length + files.length > maxImages) {
      const message = `Sie können maximal ${maxImages} Bilder hochladen.`;
      setUploadError(message);
      toast.error(message);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          throw new Error(`Bild "${file.name}" ist zu groß (max. ${maxSizeMB} MB)`);
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error(`"${file.name}" ist kein gültiges Bild`);
        }

        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Upload to server
        const result = await uploadMutation.mutateAsync({
          data: base64,
          filename: file.name,
          contentType: file.type,
        });

        return result.url;
      });

      const newUrls = await Promise.all(uploadPromises);
      setImageUrls((prev) => [...prev, ...newUrls]);

      setUploadError(null);
      toast.success(`${newUrls.length} Bild(er) erfolgreich hochgeladen`);
    } catch (error: any) {
      const message = error?.message || "Upload fehlgeschlagen. Bitte versuchen Sie es erneut.";
      setUploadError(message);
      toast.error(message);
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadError(null);
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="text-gray-500 ml-2">
          ({imageUrls.length}/{maxImages} Bilder, max. {maxSizeMB} MB pro Bild)
        </span>
      </label>

      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {imageUrls.map((url, index) => (
          <div key={index} className="relative group">
            <img
              src={url}
              alt={`Bild ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
            {index === 0 && (
              <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Hauptbild
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Upload Button */}
      {imageUrls.length < maxImages && (
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">
                  {uploading ? "Wird hochgeladen..." : "Klicken zum Hochladen"}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, JPEG (max. {maxSizeMB} MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading || imageUrls.length >= maxImages}
            />
          </label>
        </div>
      )}
      {(uploadError || errorMessage) && (
        <p className="text-sm text-red-600">{uploadError || errorMessage}</p>
      )}
    </div>
  );
}
