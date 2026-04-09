
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2, Plus, Trash2 } from 'lucide-react';
import { profileService } from '../services/profileService';

interface PhotoManagerProps {
  profileId: string;
  initialPhotos: (string | undefined)[];
}

const PhotoManager: React.FC<PhotoManagerProps> = ({ profileId, initialPhotos }) => {
  const [photos, setPhotos] = useState<(string | undefined)[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadedPhotos = photos.filter(p => !!p);
  const canAddMore = uploadedPhotos.length < 5;

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) return alert("File too large (Max 5MB)");
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) return alert("Only JPG/PNG allowed");

    setUploading(true);
    try {
      const slot = uploadedPhotos.length + 1;
      const path = await profileService.uploadPhoto(file, profileId, slot);
      await profileService.updatePhotoId(profileId, slot, path);

      const newPhotos = [...photos];
      const emptyIndex = newPhotos.findIndex(p => !p);
      if (emptyIndex !== -1) newPhotos[emptyIndex] = path;
      else newPhotos.push(path);
      setPhotos(newPhotos);
    } catch (err) {
      alert("Upload failed: " + (err as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = async (index: number) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await profileService.updatePhotoId(profileId, index + 1, null);
      const newPhotos = [...photos];
      newPhotos[index] = undefined;
      setPhotos(newPhotos);
    } catch (err) {
      alert("Removal failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
          <Camera size={14} className="text-primary-600" /> Photo Gallery (Max 5)
        </h3>
        <span className="text-[10px] font-bold text-primary-500 bg-primary-50 px-2 py-1 rounded-md">
          {uploadedPhotos.length} / 5 Photos
        </span>
      </div>

      <div className="flex flex-wrap gap-4">
        <AnimatePresence>
          {photos.map((photo, index) =>
            photo ? (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-28 h-36 rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-800 shadow-sm group"
              >
                <img
                  src={profileService.getGoogleDriveUrl(photo)!}
                  className="w-full h-full object-cover"
                  alt={`Photo ${index + 1}`}
                />
                {index === 0 && (
                  <div className="absolute top-1 left-1 px-2 py-0.5 bg-yellow-400 text-primary-950 text-[8px] font-black rounded-lg uppercase tracking-widest z-10">
                    Main
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleRemove(index)}
                    className="p-2 bg-red-500 text-white rounded-xl hover:scale-110 transition-transform"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {canAddMore && (
          <motion.label
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-28 h-36 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              disabled={uploading}
            />
            {uploading ? (
              <Loader2 className="animate-spin text-primary-500" size={24} />
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                  <Plus size={20} className="text-primary-500" />
                </div>
                <p className="text-[9px] font-black uppercase text-gray-400 group-hover:text-primary-600">Add Photo</p>
              </>
            )}
          </motion.label>
        )}
      </div>
    </div>
  );
};

export default PhotoManager;
