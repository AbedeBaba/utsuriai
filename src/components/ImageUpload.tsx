import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogoMark } from '@/components/BrandLogo';

interface ImageUploadProps {
  onImageSelect: (file: File | null, preview: string | null) => void;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function ImageUpload({
  onImageSelect,
  label = "Upload reference clothing image",
  sublabel = "Optional: Add your own outfit inspiration",
  className,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onImageSelect(file, result);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    setPreview(null);
    onImageSelect(null, null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onImageSelect]);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

      {preview ? (
        <div className="upload-zone has-image relative overflow-hidden">
          <img
            src={preview}
            alt="Uploaded preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground">
              <BrandLogoMark size="sm" />
              <span className="text-sm font-medium">Reference uploaded</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
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
            <p className="font-medium text-foreground">{label}</p>
            <p className="text-sm text-muted-foreground mt-1">{sublabel}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {isDragOver ? "Drop your image here" : "Click or drag & drop"}
          </p>
        </div>
      )}
    </div>
  );
}
