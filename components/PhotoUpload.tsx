import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { uploadPhoto } from '@/lib/api';
import styles from './PhotoUpload.module.css';

interface PhotoUploadProps {
  photoNumber: number;
  token: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function PhotoUpload({
  photoNumber,
  token,
  onSuccess,
  onError
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError('Please select an image');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const raw = fileInputRef.current.files[0];
      const file = await imageCompression(raw, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: 'image/jpeg',
      });
      await uploadPhoto(file, photoNumber, token);

      setSuccess(true);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onSuccess?.();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Photo {photoNumber}</h3>
        <p className={styles.subtitle}>Upload a clear, recent photo</p>
      </div>

      {error && <div className={`alert alert-error`}>{error}</div>}
      {success && <div className={`alert alert-success`}>Photo uploaded successfully!</div>}

      {preview ? (
        <div className={styles.previewContainer}>
          <img src={preview} alt={`Preview Photo ${photoNumber}`} className={styles.preview} />
          <div className={styles.actions}>
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Uploading...
                </>
              ) : (
                'Confirm Upload'
              )}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleClear}
              disabled={isLoading}
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        <div
          className={styles.uploadArea}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className={styles.hiddenInput}
          />
          <div className={styles.uploadIcon}>📷</div>
          <p>Click to select or drag and drop</p>
          <p className={styles.hint}>JPG, PNG (max 5MB)</p>
        </div>
      )}
    </div>
  );
}
