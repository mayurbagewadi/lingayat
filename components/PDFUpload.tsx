import React, { useState, useRef } from 'react';
import { uploadPDF } from '@/lib/api';
import styles from './PDFUpload.module.css';

interface PDFUploadProps {
  token: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function PDFUpload({
  token,
  onSuccess,
  onError
}: PDFUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('PDF size must be less than 10MB');
      return;
    }

    setError(null);
    setFileName(file.name);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError('Please select a PDF');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const file = fileInputRef.current.files[0];
      await uploadPDF(file, token);

      setSuccess(true);
      setFileName(null);
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
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Upload Bio PDF</h3>
        <p className={styles.subtitle}>Share your biographical information</p>
      </div>

      {error && <div className={`alert alert-error`}>{error}</div>}
      {success && <div className={`alert alert-success`}>PDF uploaded successfully!</div>}

      {fileName ? (
        <div className={styles.selectedContainer}>
          <div className={styles.selectedFile}>
            <div className={styles.fileIcon}>📄</div>
            <div className={styles.fileInfo}>
              <p className={styles.fileName}>{fileName}</p>
              <p className={styles.fileHint}>Ready to upload</p>
            </div>
          </div>
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
            accept=".pdf"
            onChange={handleFileSelect}
            className={styles.hiddenInput}
          />
          <div className={styles.uploadIcon}>📋</div>
          <p>Click to select or drag and drop</p>
          <p className={styles.hint}>PDF only (max 10MB)</p>
        </div>
      )}
    </div>
  );
}
