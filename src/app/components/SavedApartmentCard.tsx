"use client"

import { useState } from 'react';
import { Heart, Trash2, MapPin, Bed, Bath, Square, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Apartment } from '../types/apartment';
import Image from 'next/image';
import { ApartmentModal } from './ApartmentModal';

interface SavedApartmentCardProps {
  apartment: Apartment;
  onRemove: (id: string) => void;
}

function getHighResImage(url: string): string {
  return url.replace('s.jpg', 'od.jpg');
}

export function SavedApartmentCard({ apartment, onRemove }: SavedApartmentCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const photos = apartment.photos || [apartment.primary_photo || { href: '' }];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  };

  const previousImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer 
                 group hover:scale-[1.02] transition-transform duration-300"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={photos[currentImageIndex].href ? getHighResImage(photos[currentImageIndex].href) : '/placeholder-apartment.jpg'}
            alt="Apartment"
            fill
            className="object-cover"
            quality={100}
            sizes="(max-width: 768px) 100vw, 400px"
          />

          {/* Image Navigation */}
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full 
                          bg-black/50 text-white text-sm">
              {currentImageIndex + 1} / {photos.length}
            </div>
          )}

          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(apartment.property_id || apartment.id || '');
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-red-500/80 hover:bg-red-600 
                     text-white transition-colors backdrop-blur-sm z-20"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title and Price */}
          <div className="mb-3">
            <h3 className="text-xl font-semibold text-white mb-1 line-clamp-1">
              {apartment.location?.address?.line || apartment.title || 'Address not available'}
            </h3>
            <div className="flex items-center text-cyan-300 font-medium">
              <DollarSign className="w-4 h-4 mr-1" />
              ${(apartment.list_price_min || apartment.price)?.toLocaleString() || 'Price not available'}/mo
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-300 mb-3">
            <MapPin className="w-4 h-4 mr-1 text-cyan-400" />
            <span className="line-clamp-1">
              {apartment.location?.address ? 
                `${apartment.location.address.city}, ${apartment.location.address.state_code}` : 
                (typeof apartment.location === 'string' ? apartment.location : 'Location not available')}
            </span>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-2 text-sm text-gray-300">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1 text-cyan-400" />
              {apartment.description?.beds_min || apartment.beds || '?'} Beds
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1 text-cyan-400" />
              {apartment.description?.baths_min || apartment.baths || '?'} Baths
            </div>
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1 text-cyan-400" />
              {(apartment.description?.sqft_min || apartment.size)?.toLocaleString() || '?'} ft²
            </div>
          </div>

          {/* Details/Amenities */}
          {(apartment.details?.[0]?.text || apartment.amenities) && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex flex-wrap gap-2">
                {(apartment.details?.[0]?.text || apartment.amenities || []).slice(0, 3).map((detail, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs rounded-full bg-cyan-500/20 text-cyan-300"
                  >
                    {detail}
                  </span>
                ))}
                {(apartment.details?.[0]?.text?.length || apartment.amenities?.length || 0) > 3 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-gray-300">
                    +{((apartment.details?.[0]?.text?.length || apartment.amenities?.length || 0) - 3)} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ApartmentModal
          apartment={apartment}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
} 