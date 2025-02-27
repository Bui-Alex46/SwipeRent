"use client"

import { X, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"

interface ImageViewerProps {
  images: Array<{ href: string }>;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

function getHighResImage(url: string): string {
  return url.replace('s.jpg', 'od.jpg');
}

export function ImageViewer({ images, currentIndex, onClose, onNext, onPrevious }: ImageViewerProps) {
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-lg"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Image container */}
        <div className="h-screen w-screen flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={images[currentIndex].href ? getHighResImage(images[currentIndex].href) : '/placeholder-apartment.jpg'}
              alt={`Image ${currentIndex + 1}`}
              fill
              className="object-contain"
              quality={100}
              priority
              sizes="100vw"
            />
          </div>
        </div>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={onPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
} 