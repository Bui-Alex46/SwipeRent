"use client"

import { X, ChevronLeft, ChevronRight, CheckCircle, Loader2 } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import type { Apartment } from "../types/apartment"
import { createPortal } from "react-dom"
import { useState, useEffect } from "react"
import { ImageViewer } from "./ImageViewer"
import { useRouter } from "next/navigation"
import { InfoModal } from './InfoModal'

interface ApartmentModalProps {
  apartment: {
    id?: string;
    property_id?: string;
    title?: string;
    price?: number;
    pet_policy?: {
      cats: boolean;
      dogs: boolean;
    };
    advertisers?: Array<{
      office?: {
        name: string;
      };
    }>;
    location: {
      address: {
        line: string;
        city: string;
        state_code: string;
      };
      county?: string;
      neighborhoods?: string[];
      street_view_url?: string;
    };
    list_price_min?: number;
    description: {
      beds_min?: number;
      baths_min?: number;
      sqft_min?: number;
    };
    details?: Array<{
      category: string;
      text: string[];
    }>;
    primary_photo?: { href: string };
    photos?: Array<{ href: string }>;
  };
  isOpen: boolean;
  onClose: () => void;
}

function getHighResImage(url: string): string {
  return url.replace('s.jpg', 'od.jpg');
}

export function ApartmentModal({ apartment, isOpen, onClose }: ApartmentModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [viewerImageIndex, setViewerImageIndex] = useState(0)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [applicationError, setApplicationError] = useState<string | null>(null)
  const [applicationSuccess, setApplicationSuccess] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoModalContent, setInfoModalContent] = useState({
    title: '',
    message: '',
    actionLink: '',
    actionText: ''
  })
  const router = useRouter()
  const photos = apartment.photos || [apartment.primary_photo || { href: '' }]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % photos.length)
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const handleOpenViewer = () => {
    setViewerImageIndex(currentImageIndex)
    setIsImageViewerOpen(true)
  }

  const nextViewerImage = () => {
    setViewerImageIndex((prev) => (prev + 1) % photos.length)
  }

  const previousViewerImage = () => {
    setViewerImageIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const handleApply = async () => {
    try {
      setIsApplying(true)
      setApplicationError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth')
        return
      }

      // First check profile
      const profileResponse = await fetch('http://localhost:3001/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!profileResponse.ok) {
        setInfoModalContent({
          title: 'Complete Your Profile',
          message: 'Please complete your profile before applying to apartments. This helps property managers review your application.',
          actionLink: '/profile',
          actionText: 'Complete Profile'
        })
        setShowInfoModal(true)
        return
      }

      // Then check documents
      const documentsResponse = await fetch('http://localhost:3001/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const documents = await documentsResponse.json()
      if (!documents || documents.length === 0) {
        setInfoModalContent({
          title: 'Upload Required Documents',
          message: 'Please set up your profile and upload your documents before applying. This is required for all applications.',
          actionLink: '/profile',
          actionText: 'Set up profile'
        })
        setShowInfoModal(true)
        return
      }

      // If all checks pass, proceed with application
      const response = await fetch('http://localhost:3001/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          apartmentId: apartment.id || apartment.property_id,
          propertyManagerEmail: 'manager@example.com'
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      setApplicationSuccess(true)
      setHasApplied(true)
      setApplicationStatus('pending')
    } catch (err) {
      setApplicationError(
        err instanceof Error ? err.message : 'Failed to submit application'
      )
    } finally {
      setIsApplying(false)
    }
  }

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!isOpen) return
      
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch(`http://localhost:3001/api/applications/check/${apartment.id || apartment.property_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()
        setHasApplied(data.hasApplied)
        setApplicationStatus(data.application?.status || null)
      } catch (err) {
        console.error('Error checking application status:', err)
      }
    }

    checkApplicationStatus()
  }, [isOpen, apartment.id, apartment.property_id])

  if (!isOpen) return null

  return (
    <>
      {createPortal(
        <AnimatePresence>
          <motion.div
            key="apartment-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-y-auto"
          >
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
              onClick={onClose}
            />

            {/* Modal Content */}
            <div className="min-h-screen px-4 py-8 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Image Gallery */}
                <div className="relative h-[300px] md:h-[400px] w-full group">
                  <div 
                    className="relative w-full h-full cursor-pointer"
                    onClick={handleOpenViewer}
                  >
                    <Image
                      src={photos[currentImageIndex].href ? getHighResImage(photos[currentImageIndex].href) : '/placeholder-apartment.jpg'}
                      alt={`Apartment Photo ${currentImageIndex + 1}`}
                      fill
                      className="object-cover"
                      quality={100}
                      priority
                      sizes="(max-width: 768px) 100vw, 1200px"
                    />
                  </div>

                  {/* Image Navigation */}
                  {photos.length > 1 && (
                    <>
                      {/* Previous Button */}
                      <button
                        onClick={previousImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white 
                                 hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>

                      {/* Next Button */}
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white 
                                 hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>

                      {/* Image Counter */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
                        {currentImageIndex + 1} / {photos.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto">
                  {/* Title/Address */}
                  <h2 className="text-2xl font-bold mb-4">
                    {apartment.location?.address?.line || apartment.title || 'Address not available'}
                  </h2>
                  
                  {/* Price and Location */}
                  <div className="mb-6">
                    <p className="text-xl font-semibold">
                      ${(apartment.list_price_min || apartment.price)?.toLocaleString() || 'Price not available'}/month
                    </p>
                    <p className="text-gray-600">
                      {apartment.location?.address ? 
                        `${apartment.location.address.city}, ${apartment.location.address.state_code}` : 
                        (typeof apartment.location === 'string' ? apartment.location : 'Location not available')}
                      </p>
                  </div>

                  {/* One-Click Apply - Moved up and made more compact */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Like what you see?</h3>
                        <p className="text-sm text-gray-600">Apply instantly with verified documents</p>
                      </div>
                      {hasApplied ? (
                        <div className="flex items-center space-x-2">
                        
                          <span className="text-green-500">
                            {applicationStatus === 'pending' ? 'Application Pending' : 'Applied'}
                          </span>
                          <button
                            disabled
                            className="px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                          >
                            Applied!
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleApply}
                          disabled={isApplying}
                          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg
                                   hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isApplying ? 'Applying...' : 'One-Click Apply'}
                        </button>
                      )}
                    </div>
                    {applicationError && (
                      <div className="mt-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg">
                        {applicationError}
                      </div>
                    )}
                  </div>

                  {/* Amenities */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Community Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {apartment.details?.[0]?.text.map((amenity, index) => (
                        <div 
                          key={index}
                          className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pet Policy */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Pet Policy</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="font-medium">Cats Allowed</p>
                        <p className="text-gray-600">{apartment.pet_policy?.cats ? "Yes" : "No"}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="font-medium">Dogs Allowed</p>
                        <p className="text-gray-600">{apartment.pet_policy?.dogs ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-3">Property Management</h3>
                    <p className="text-gray-600">{apartment.advertisers?.[0]?.office?.name}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Image Viewer Modal */}
            {isImageViewerOpen && (
              <ImageViewer
                images={photos}
                currentIndex={viewerImageIndex}
                onClose={() => setIsImageViewerOpen(false)}
                onNext={nextViewerImage}
                onPrevious={previousViewerImage}
              />
            )}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        {...infoModalContent}
      />
    </>
  )
} 