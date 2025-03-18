'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  currentImage?: string | null;
  onImageUpload: (file: File) => void;
  onImageRemove?: () => void;
  className?: string;
  size?: number;
  placeholderText?: string;
}

export default function ImageUploader({
  currentImage,
  onImageUpload,
  onImageRemove,
  className = '',
  size = 100,
  placeholderText = 'Upload Photo'
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Pass the file to the parent component
    onImageUpload(file);
    
    // Reset input value so the same file can be uploaded again if needed
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (onImageRemove) onImageRemove();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const displayedImage = previewUrl || currentImage;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div 
        className="relative cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        {displayedImage ? (
          <div className="relative" style={{ width: size, height: size }}>
            <Image
              src={displayedImage}
              alt="Uploaded image"
              width={size}
              height={size}
              className="rounded-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-sm">Change</span>
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center bg-secondary-light border border-primary/30 rounded-full text-gray-400 hover:text-primary transition-colors"
            style={{ width: size, height: size }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs mt-1">{placeholderText}</span>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
      
      {displayedImage && onImageRemove && (
        <button
          type="button"
          onClick={handleRemoveImage}
          className="mt-2 text-sm text-primary hover:text-primary-light"
        >
          Remove Photo
        </button>
      )}
    </div>
  );
}
