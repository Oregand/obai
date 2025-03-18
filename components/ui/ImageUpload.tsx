'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import LoadingSpinner from './LoadingSpinner';

interface ImageUploadProps {
  currentImage?: string | null;
  type: 'user' | 'persona';
  id: string;
  onUploadSuccess: (imageUrl: string) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function ImageUpload({ 
  currentImage, 
  type, 
  id, 
  onUploadSuccess,
  className = '',
  size = 'medium'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Determine dimensions based on size
  const getDimensions = () => {
    switch (size) {
      case 'small': return { width: 64, height: 64 };
      case 'large': return { width: 160, height: 160 };
      default: return { width: 100, height: 100 }; // medium
    }
  };
  
  const { width, height } = getDimensions();
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please use JPEG, PNG, WebP, or GIF images.');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload the file
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('id', id);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      
      // Call the success callback with the new image URL
      onUploadSuccess(data.imageUrl);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <div 
        onClick={handleClick}
        className={`relative rounded-full overflow-hidden cursor-pointer 
                  hover:opacity-90 transition-opacity border-2 
                  ${preview ? 'border-primary/50' : 'border-dashed border-primary/30'}
                  flex items-center justify-center bg-midnight-lighter`}
        style={{ width, height }}
      >
        {isUploading ? (
          <LoadingSpinner size="small" />
        ) : preview ? (
          <Image 
            src={preview} 
            alt="Profile"
            width={width}
            height={height}
            className="object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-xs font-medium text-center">
              {size === 'small' ? '+' : 'Upload Image'}
            </span>
          </div>
        )}
        
        {/* Camera icon overlay in the bottom-right corner when an image exists */}
        {preview && !isUploading && (
          <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
      </div>
      
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />
      
      {error && (
        <div className="text-primary text-xs mt-1 max-w-full">
          {error}
        </div>
      )}
    </div>
  );
}
