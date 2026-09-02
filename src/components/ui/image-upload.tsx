'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Star, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  label?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 5,
  label = 'Product Images',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/'));

    if (fileArray.length === 0) {
      setErrorMessage('Please select valid image files (JPG, PNG, WEBP).');
      return;
    }

    if (value.length + fileArray.length > maxFiles) {
      setErrorMessage(`You can upload a maximum of ${maxFiles} images.`);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    fileArray.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload images');
      }

      if (data.urls && Array.isArray(data.urls)) {
        onChange([...value, ...data.urls]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading images. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const updated = value.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetPrimary = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    const selected = value[indexToPrimary];
    const rest = value.filter((_, idx) => idx !== indexToPrimary);
    onChange([selected, ...rest]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700">{label}</label>
        <span className="text-[11px] text-gray-400">
          {value.length} / {maxFiles} uploaded
        </span>
      </div>

      {errorMessage && (
        <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
          {errorMessage}
        </p>
      )}

      {/* Upload Dropzone */}
      {value.length < maxFiles && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
            dragOver
              ? 'border-brand-600 bg-brand-50/60'
              : 'border-gray-300 hover:border-brand-500 bg-gray-50/50 hover:bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-8 h-8 text-brand-700 animate-spin" />
              <p className="text-xs font-semibold text-gray-700">Uploading product image...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-brand-100/80 text-brand-800 flex items-center justify-center shadow-sm">
                <UploadCloud className="w-6 h-6 text-brand-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">
                  Click to browse or drag & drop product photos
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Supports PNG, JPG, JPEG, WEBP (Up to 5MB each)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Image Previews Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {value.map((url, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl overflow-hidden border-2 bg-gray-100 group aspect-square shadow-sm ${
                idx === 0 ? 'border-brand-600 ring-2 ring-brand-100' : 'border-gray-200'
              }`}
            >
              <Image
                src={url}
                alt={`Product Image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />

              {/* Cover badge */}
              {idx === 0 && (
                <div className="absolute top-2 left-2 bg-brand-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                  Cover Photo
                </div>
              )}

              {/* Action Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetPrimary(idx);
                    }}
                    title="Set as Cover Photo"
                    className="p-1.5 rounded-full bg-white/90 text-amber-600 hover:bg-white transition"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(idx);
                  }}
                  title="Remove Image"
                  className="p-1.5 rounded-full bg-white/90 text-red-600 hover:bg-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
