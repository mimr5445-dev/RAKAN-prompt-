/**
 * RAKAN Prompt - Fullscreen Image Gallery & Zoom Modal
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';

interface ImageZoomModalProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImg = images[currentIndex];

  const handleNext = () => {
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 2 : 1));
  };

  const downloadImage = () => {
    const a = document.createElement('a');
    a.href = currentImg;
    a.download = `RAKAN_Prompt_Image_${currentIndex + 1}.jpg`;
    a.click();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col justify-between overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent text-white z-10">
          <span className="text-xs font-semibold px-2.5 py-1 bg-white/10 rounded-full">
            {currentIndex + 1} / {images.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadImage}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={toggleZoom}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {zoomLevel === 1 ? <ZoomIn className="w-4 h-4" /> : <ZoomOut className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-amber-500/80 text-stone-900 font-bold hover:bg-amber-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Display Container */}
        <div className="flex-1 relative flex items-center justify-center p-2 overflow-auto">
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 z-10 p-2.5 rounded-full bg-stone-900/60 text-white backdrop-blur-md hover:bg-stone-800/80 transition-all border border-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 z-10 p-2.5 rounded-full bg-stone-900/60 text-white backdrop-blur-md hover:bg-stone-800/80 transition-all border border-white/10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <motion.img
            key={currentIndex}
            src={currentImg}
            alt="Prompt Full Preview"
            animate={{ scale: zoomLevel }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl cursor-pointer"
            onClick={toggleZoom}
          />
        </div>

        {/* Thumbnails Bar */}
        {images.length > 1 && (
          <div className="p-3 flex justify-center gap-2 overflow-x-auto bg-black/60 z-10">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setZoomLevel(1);
                  setCurrentIndex(idx);
                }}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                  idx === currentIndex ? 'border-amber-500 scale-105' : 'border-white/20 opacity-60'
                }`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
