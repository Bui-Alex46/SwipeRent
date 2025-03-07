"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {MapPin, DollarSign, Bed, Bath, Square } from "lucide-react"
import type { Apartment } from "../types/apartment"
import { ApartmentModal } from "./ApartmentModal"

interface SwipeCardProps {
  apartment: Apartment
  prevApartment?: Apartment
  nextApartment?: Apartment
  onSwipe?: (direction: 'left' | 'right') => void
}

function getHighResImage(url: string): string {
  // Convert to high resolution version
  return url.replace(/s\.jpg$/, "od-w1024_h768.jpg");
}

export function SwipeCard({ apartment, prevApartment, nextApartment, onSwipe }: SwipeCardProps) {
  const [dragX, setDragX] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)

  console.log('Apartment data:', apartment); // Debug log
  console.log('Image URL:', apartment.primary_photo?.href); // Debug log

  const handleDragStart = () => {
    setDirection(null)
  }

  const handleDrag = (event: DragEvent, info: { offset: { x: number } }) => {
    setDragX(info.offset.x)
  }

  const handleDragEnd = (event: DragEvent, info: { offset: { x: number } }) => {
    const dragDistance = info.offset.x
    const threshold = 100

    if (dragDistance > threshold && onSwipe) {
      setDirection('right')
      onSwipe('right')
    } else if (dragDistance < -threshold && onSwipe) {
      setDirection('left')
      onSwipe('left')
    }
    setDragX(0)
  }

  const getOverlayOpacity = () => {
    return Math.min(Math.abs(dragX) / 200, 0.8)
  }

  return (
    <div className="relative w-full max-w-md mx-auto h-[600px]">
      {/* Previous Card */}
      {prevApartment && (
        <div
          className="absolute left-0 top-0 w-full h-full"
          style={{
            transform: 'translateX(-70%) scale(0.9)',
            opacity: 0.5,
            filter: 'blur(2px)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <ApartmentCard apartment={prevApartment} />
        </div>
      )}

      {/* Next Card */}
      {nextApartment && (
        <div
          className="absolute left-0 top-0 w-full h-full"
          style={{
            transform: 'translateX(70%) scale(0.9)',
            opacity: 0.5,
            filter: 'blur(2px)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <ApartmentCard apartment={nextApartment} />
        </div>
      )}

      {/* Current Card */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={apartment.id}
          className="absolute left-0 top-0 w-full h-full z-10"
          initial={{ 
            x: direction === null ? 0 : (direction === 'left' ? 1000 : -1000),
            opacity: direction === null ? 1 : 0
          }}
          animate={{ 
            x: 0,
            opacity: 1,
            scale: 1,
            rotate: dragX > 0 ? Math.min(dragX / 15, 15) : Math.max(dragX / 15, -15)
          }}
          exit={{ 
            x: direction === 'left' ? -1000 : 1000,
            opacity: 0,
            transition: { duration: 0.3 }
          }}
          transition={{ 
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onClick={() => setIsModalOpen(true)}
        >
          <div className="relative w-full h-full">
            {/* Like Overlay */}
            <div 
              className="absolute inset-0 bg-green-500 rounded-3xl z-10 pointer-events-none transition-opacity"
              style={{ opacity: dragX > 0 ? getOverlayOpacity() : 0 }}
            />
            
            {/* Dislike Overlay */}
            <div 
              className="absolute inset-0 bg-red-500 rounded-3xl z-10 pointer-events-none transition-opacity"
              style={{ opacity: dragX < 0 ? getOverlayOpacity() : 0 }}
            />

            <ApartmentCard apartment={apartment} />
          </div>
        </motion.div>
      </AnimatePresence>

      {isModalOpen && (
        <ApartmentModal 
          apartment={apartment}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

// Separate the card UI into its own component
function ApartmentCard({ apartment }: { apartment: Apartment }) {
  const beds = apartment.description?.beds_min || 
               apartment.description?.beds_max || 
               apartment.description?.beds || 
               apartment.beds || 
               '?';

  const baths = apartment.description?.baths_min || 
                apartment.description?.baths_max || 
                apartment.description?.baths || 
                apartment.description?.baths_full_calc ||
                apartment.baths || 
                '?';

  const sqft = apartment.description?.sqft_min || 
               apartment.description?.sqft_max || 
               apartment.description?.sqft || 
               apartment.size || 
               '?';

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gray-800 shadow-2xl">
      {/* Image */}
      <div className="relative w-full h-full">
        <Image
          src={apartment.primary_photo?.href ? 
            getHighResImage(apartment.primary_photo.href) : 
            '/placeholder-apartment.jpg'
          }
          alt="Apartment"
          fill
          className="object-cover"
          priority
          quality={95}  // Increased quality
          sizes="(max-width: 768px) 100vw, 600px"  // Optimized sizes
          loading="eager"  // Immediate loading
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="text-white">
          <h3 className="text-2xl font-bold mb-2 line-clamp-1">
            {apartment.location?.address?.line || 'Address not available'}
          </h3>
          <div className="flex items-center text-cyan-300 font-medium mb-2">
            <DollarSign className="w-5 h-5 mr-1" />
            ${(apartment.list_price_min || apartment.price)?.toLocaleString() || 'Price not available'}/mo
          </div>
          <div className="flex items-center text-gray-200 mb-4">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="line-clamp-1">
              {apartment.location?.address?.city}, {apartment.location?.address?.state_code}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-200">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1 text-cyan-400" />
              {beds} bed
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1 text-cyan-400" />
              {baths} bath
            </div>
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1 text-cyan-400" />
              {typeof sqft === 'number' ? sqft.toLocaleString() : sqft} ft²
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

