
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { profileService } from '../services/profileService';

interface PhotoManagerProps {
  profileId: string;
  initialPhotos: (string | undefined)[]; // Array of 5 file IDs
}

const PhotoManager: React.FC<PhotoManagerProps> = ({ profileId, initialPhotos }) => {
  const [photos, setPhotos] = useState<(string | undefined)[]>(initialPhotos);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (slot: number, file: File) => {
    if (file.size > 5 * 1024 * 1024) return alert("File too large (Max 5MB)");
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) return alert("Only JPG/PNG allowed");

    setUploadingSlot(slot);
    setProgress(0);

    setUploadingSlot(slot);
    setProgress(10); // Start progress

    try {
      // Real Supabase Upload
      const path = await profileService.uploadPhoto(file, profileId, slot + 1);

      // Update Profile Record
      await profileService.updatePhotoId(profileId, slot + 1, path);

      const newPhotos = [...photos];
      newPhotos[slot] = path;
      setPhotos(newPhotos);
      setProgress(100);

      setTimeout(() => {
        setUploadingSlot(null);
        setProgress(0);
      }, 500);
    } catch (err) {
      alert("Upload failed: " + (err as Error).message);
      setUploadingSlot(null);
      setProgress(0);
    }
  };

  const handleRemove = async (slot: number) => {
    if (!confirm("Permanently delete this photo from Google Drive?")) return;
    try {
      await profileService.updatePhotoId(profileId, slot + 1, null);
      const newPhotos = [...photos];
      newPhotos[slot] = undefined;
      setPhotos(newPhotos);
    } catch (err) {
      alert("Removal failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
          <Camera size={14} className="text-primary-600" /> Google Drive Photo Gallery (Max 5)
        </h3>
        <span className="text-[10px] font-bold text-primary-500 bg-primary-50 px-2 py-1 rounded-md">
          {photos.filter(p => !!p).length} / 5 Slots Used
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[0, 1, 2, 3, 4].map((slot) => (
          <div key={slot} className="relative aspect-[3/4] group">
            <AnimatePresence mode="wait">
              {photos[slot] ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-800 relative shadow-sm"
                >
                  <img
                    src={profileService.getGoogleDriveUrl(photos[slot])!}
                    className="w-full h-full object-cover"
                    alt={`Slot ${slot + 1}`}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleRemove(slot)}
                      className="p-2 bg-red-500 text-white rounded-xl hover:scale-110 transition-transform shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ) : uploadingSlot === slot ? (
                <div className="w-full h-full rounded-2xl border-2 border-primary-200 bg-primary-50 flex flex-col items-center justify-center p-4">
                  <Loader2 className="animate-spin text-primary-600 mb-2" size={24} />
                  <div className="w-full bg-primary-200 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="bg-primary-600 h-full"
                    />
                  </div>
                  <p className="text-[8px] font-black uppercase mt-2 text-primary-600">{progress}% Uploading</p>
                </div>
              ) : (
                <label className="w-full h-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleUpload(slot, e.target.files[0])}
                  />
                  <ImageIcon size={24} className="text-gray-300 group-hover:text-primary-400" />
                  <p className="text-[8px] font-black uppercase text-gray-400 group-hover:text-primary-600">Add Photo</p>
                </label>
              )}
            </AnimatePresence>
            {slot === 0 && photos[slot] && (
              <div className="absolute -top-2 -left-2 px-2 py-0.5 bg-gold-500 text-primary-950 text-[8px] font-black rounded-lg shadow-md uppercase tracking-widest z-10 border border-white">
                Main
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex gap-3 items-start">
        <ImageIcon className="text-blue-600 shrink-0" size={18} />
        <div>
          <p className="text-[10px] font-black uppercase text-blue-900 dark:text-blue-200 mb-1">Photo Policy</p>
          <p className="text-[10px] font-bold text-blue-800/70 dark:text-blue-300/60 leading-relaxed">
            Photos are stored securely on Google Drive. The first slot is used as your public profile picture. High-quality images attract 3x more interests.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhotoManager;
