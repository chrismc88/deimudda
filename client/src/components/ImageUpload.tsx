import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Upload, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ImageUploadProps {
  label: string;
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  maxSizeMB?: number;
}

export default function ImageUpload({ label, currentImageUrl, onImageUploaded, maxSizeMB = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);

  // Update preview when currentImageUrl changes
  useEffect(() => {
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  const uploadImage = trpc.upload.image.useMutation({
    onSuccess: (data) => {
      setPreviewUrl(data.url);
      onImageUploaded(data.url);
      toast.success("Bild erfolgreich hochgeladen!");
      setUploading(false);
    },
    onError: (error: any) => {
      toast.error("Fehler beim Hochladen: " + error.message);
      setUploading(false);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast.error(`Bild ist zu groß (max. ${maxSizeMB} MB)`);
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Nur Bilddateien sind erlaubt");
      return;
    }

    setUploading(true);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      uploadImage.mutate({
        filename: file.name,
        data: base64,
        contentType: file.type,
      });
    };
    reader.onerror = () => {
      toast.error("Fehler beim Lesen der Datei");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreviewUrl(undefined);
    onImageUploaded("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {previewUrl ? (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id={`file-upload-${label}`}
          />
          <Label
            htmlFor={`file-upload-${label}`}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Wird hochgeladen..." : "Bild auswählen"}
          </Label>
          <span className="text-sm text-gray-500">Max. {maxSizeMB} MB</span>
        </div>
      )}
    </div>
  );
}

