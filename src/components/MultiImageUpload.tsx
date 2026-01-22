import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogoMark } from '@/components/BrandLogo';

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  type: 'outfit' | 'accessory' | 'jewelry' | 'other';
}

interface MultiImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void;
  images: UploadedImage[];
  maxImages?: number;
  className?: string;
}

const imageTypes = [
  { id: 'outfit', label: 'Outfit' },
  { id: 'accessory', label: 'Accessory' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'other', label: 'Other' },
] as const;

export function MultiImageUpload({
  onImagesChange,
  images,
  maxImages = 5,
  className,
}: MultiImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    const filesToProcess = fileArray.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const newImage: UploadedImage = {
            id: crypto.randomUUID(),
            file,
            preview: result,
            type: 'outfit',
          };
          onImagesChange([...images, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  }, [images, maxImages, onImagesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [handleFiles]);

  const handleRemove = useCallback((id: string) => {
    onImagesChange(images.filter(img => img.id !== id));
  }, [images, onImagesChange]);

  const handleTypeChange = useCallback((id: string, type: UploadedImage['type']) => {
    onImagesChange(images.map(img => 
      img.id === id ? { ...img, type } : img
    ));
  }, [images, onImagesChange]);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const canAddMore = images.length < maxImages;

  return (
    <div className={cn("w-full space-y-4", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((image) => (
            <div 
              key={image.id} 
              className="relative group bg-card border border-border rounded-xl overflow-hidden"
            >
              <img
                src={image.preview}
                alt="Uploaded"
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Type selector */}
              <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <select
                  value={image.type}
                  onChange={(e) => handleTypeChange(image.id, e.target.value as UploadedImage['type'])}
                  className="w-full text-xs bg-secondary/90 border-0 rounded px-2 py-1 text-foreground"
                >
                  {imageTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Remove button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(image.id)}
                className="absolute top-2 right-2 h-7 w-7 bg-background/80 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Type badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary/90 text-primary-foreground text-xs rounded-full capitalize">
                {image.type}
              </div>
            </div>
          ))}

          {/* Add more button */}
          {canAddMore && (
            <button
              onClick={handleClick}
              className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-xl hover:border-primary/50 hover:bg-secondary/30 transition-colors"
            >
              <Plus className="h-8 w-8 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Add More</span>
            </button>
          )}
        </div>
      )}

      {/* Upload Zone (when no images) */}
      {images.length === 0 && (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "upload-zone cursor-pointer flex flex-col items-center justify-center gap-4 min-h-[200px]",
            isDragOver && "drag-over"
          )}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            {isDragOver ? (
              <ImageIcon className="h-8 w-8 text-primary animate-pulse" />
            ) : (
              <Upload className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Upload Clothing & Accessories</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add outfits, jewelry, accessories - up to {maxImages} images
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {isDragOver ? "Drop your images here" : "Click or drag & drop multiple images"}
          </p>
        </div>
      )}

      {/* Drop zone when images exist */}
      {images.length > 0 && canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-xl p-4 text-center transition-colors",
            isDragOver 
              ? "border-primary bg-primary/5" 
              : "border-border"
          )}
        >
          <p className="text-sm text-muted-foreground">
            <BrandLogoMark size="sm" className="inline mr-1" />
            Drop more images here or click "Add More" above
          </p>
        </div>
      )}

      {/* Counter */}
      <p className="text-xs text-muted-foreground text-center">
        {images.length} of {maxImages} images uploaded
      </p>
    </div>
  );
}
