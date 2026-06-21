import React, { useState } from "react";
import { X, Upload, Camera } from "lucide-react";
import { m, AnimatePresence } from 'framer-motion';
import Image from "next/image";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUsername: string;
  initialPfp: string;
  onSave: (username: string, pfpUrl: string) => void;
}

export function ProfileModal({ isOpen, onClose, initialUsername, initialPfp, onSave }: ProfileModalProps) {
  const [username, setUsername] = useState(initialUsername);
  const [pfpUrl, setPfpUrl] = useState(initialPfp);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(username.trim(), pfpUrl.trim());
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPfpUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-sm bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-outline-variant bg-surface-container-low">
              <h3 className="font-headline-lg text-lg text-on-background">
                Edit Profile
              </h3>
              <button type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer mb-3">
                  <input
                    aria-label="Upload Avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-24 h-24 rounded-full border border-outline-variant bg-surface-container-highest overflow-hidden flex items-center justify-center group-hover:border-primary transition-colors">
                    {pfpUrl ? (
                      <Image 
                        src={pfpUrl} 
                        alt="Profile" 
                        fill
                        className="object-cover" 
                        sizes="96px"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-on-surface-variant" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-primary text-on-primary p-1.5 rounded-full border-2 border-surface-container-lowest shadow-sm pointer-events-none">
                    <Upload className="w-4 h-4" />
                  </div>
                </div>
                <p className="font-ui-label text-sm text-on-surface-variant">Upload Avatar</p>
              </div>

              <div className="mb-6">
                <label htmlFor="username" className="block font-ui-label text-sm font-semibold text-on-background mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Satoshi"
                  maxLength={20}
                  className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-base text-on-background placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary text-on-primary rounded-lg font-ui-label text-base font-semibold btn-primary-inset hover:bg-primary-hover transition-colors"
              >
                Save Changes
              </button>
            </form>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}

