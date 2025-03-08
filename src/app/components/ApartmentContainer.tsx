"use client"

import { useState, useEffect } from "react"
import { motion, type PanInfo, useAnimation } from "framer-motion"
import type { Apartment } from "../types/apartment"
import { SwipeCard } from "./SwipeCard"
import { ApartmentInfo } from "./ApartmentInfo"
import { useRouter } from 'next/navigation'

interface ApartmentContainerProps {
  apartment: Apartment
  onSwipe: (direction: "left" | "right") => void
}

export function ApartmentContainer({ apartment, onSwipe }: ApartmentContainerProps) {
  const [exitX, setExitX] = useState(0)
  const [dragX, setDragX] = useState(0)
  const controls = useAnimation()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Current auth token:', token ? 'Present' : 'Missing');
  }, []);

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      setExitX(1000)
      // Add to favorites when swiped right
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/auth')
          return
        }

        const response = await fetch('https://swiperent.onrender.com/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ apartment })
        })

        const data = await response.json()
        
        if (!response.ok) {
          if (response.status === 403 || response.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('token')
            router.push('/auth')
            return
          }
          throw new Error(data.error || 'Failed to add to favorites')
        }

        console.log('Successfully added to favorites:', data)
      } catch (error) {
        console.error('Error adding to favorites:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        })
        
        // Handle authentication errors
        if (error instanceof Error && error.message === 'Invalid token') {
          localStorage.removeItem('token')
          router.push('/auth')
          return
        }
      }
      onSwipe("right")
    } else if (info.offset.x < -threshold) {
      setExitX(-1000)
      onSwipe("left")
    }
    setDragX(0)
  }

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragX(info.offset.x)
  }

  const getOverlayOpacity = () => {
    const maxOpacity = 0.8
    const absX = Math.abs(dragX)
    const opacity = (absX / 200) * maxOpacity
    return Math.min(opacity, maxOpacity)
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      animate={controls}
      exit={{ x: exitX }}
      whileDrag={{ scale: 1.05, rotate: dragX > 0 ? 5 : -5 }}
      className="relative flex flex-col md:flex-row justify-center items-center md:items-start gap-4 w-full max-w-[90%] md:max-w-[800px] bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl p-4 md:p-6 overflow-hidden border border-white/20"
    >
      {/* Like Overlay */}
      <div 
        className="absolute inset-0 bg-cyan-500 pointer-events-none transition-opacity"
        style={{ 
          opacity: dragX > 0 ? getOverlayOpacity() : 0,
          zIndex: 10 
        }}
      />
      
      {/* Dislike Overlay */}
      <div 
        className="absolute inset-0 bg-red-500 pointer-events-none transition-opacity"
        style={{ 
          opacity: dragX < 0 ? getOverlayOpacity() : 0,
          zIndex: 10 
        }}
      />

      <div className="w-full md:w-[400px] relative z-20">
        <SwipeCard apartment={apartment} />
      </div>
      <div className="w-full md:w-[300px] relative z-20">
        <ApartmentInfo apartment={apartment} />
      </div>
    </motion.div>
  )
} 