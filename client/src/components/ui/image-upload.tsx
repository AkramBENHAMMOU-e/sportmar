import { useState, useRef, useEffect } from "react";
import { Upload, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CloudinarySignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
}

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Si value change depuis l'extérieur, mettre à jour previewUrl
    if (value && value !== previewUrl) {
      setPreviewUrl(value);
    }
  }, [value]);

  const getCloudinarySignature = async (): Promise<CloudinarySignature> => {
    const response = await fetch('/api/cloudinary/signature');
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la signature');
    }
    return response.json();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Créer un objet FormData pour envoyer le fichier
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "sportmaroc_uploads");
      formData.append("folder", "sportmaroc");
      
      // Envoyer le fichier à Cloudinary en utilisant un upload non signé
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/df59lsiz9/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement de l'image");
      }
      
      const data = await response.json();
      const imageUrl = data.secure_url;
      
      // Mettre à jour l'état et appeler onChange
      setPreviewUrl(imageUrl);
      onChange(imageUrl);
    } catch (error) {
      console.error("Erreur de téléchargement:", error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    onChange("");
    setUploadError(null);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={disabled || isUploading}
      />

      {previewUrl ? (
        // Afficher l'aperçu de l'image
        <div className="relative rounded-md overflow-hidden">
          <img
            src={previewUrl}
            alt="Aperçu du produit"
            className="object-cover w-full h-48"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="destructive"
              size="icon"
              type="button"
              onClick={handleRemoveImage}
              disabled={disabled || isUploading}
              className="w-8 h-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        // Afficher la zone de drop ou le bouton d'upload
        <div 
          className="border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors"
          onClick={triggerFileInput}
        >
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-1">
            Cliquez pour télécharger une image
          </p>
          <p className="text-xs text-muted-foreground">
            SVG, PNG, JPG or WEBP (max. 2MB)
          </p>
        </div>
      )}

      {isUploading && (
        <div className="flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
          <span className="text-sm text-muted-foreground">
            Téléchargement en cours...
          </span>
        </div>
      )}

      {uploadError && (
        <div className="text-sm text-destructive">{uploadError}</div>
      )}
    </div>
  );
} 