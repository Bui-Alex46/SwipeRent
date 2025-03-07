"use client"

import { useState, useEffect } from "react"
import { SwipeCard } from "../components/SwipeCard"
import { ActionButtons } from "../components/ActionButtons"
import { FilterComponent } from "../components/FilterComponent"
import { fetchApartments, type FilterParams } from "../services/apartmentService"
import type { Apartment } from "../types/apartment"
import { useRouter } from 'next/navigation'

export default function SwipePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<number[]>([])
  const router = useRouter()

  useEffect(() => {
    loadApartments({});
  }, []);

  useEffect(() => {
    const handleFilters = (event: CustomEvent<FilterParams>) => {
      handleFilterChange(event.detail);
    };

    window.addEventListener('applyFilters', handleFilters as EventListener);
    return () => {
      window.removeEventListener('applyFilters', handleFilters as EventListener);
    };
  }, []);

  const loadApartments = async (filters: FilterParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchApartments(filters);
      setApartments(data);
      setCurrentIndex(0);
      setHistory([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load apartments';
      setError(errorMessage);
      console.error('Load apartments error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = async (filters: FilterParams) => {
    await loadApartments(filters);
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth')
        return
      }

      const response = await fetch('http://localhost:3001/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ apartment: apartments[currentIndex] })
      })

      if (!response.ok) {
        throw new Error('Failed to add to favorites')
      }

      // Move to next apartment
      goToNext()
    } catch (error) {
      console.error('Error adding to favorites:', error)
    }
  }

  const goToNext = () => {
    if (currentIndex < apartments.length - 1) {
      setHistory(prev => [...prev, currentIndex])
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goToPrevious = () => {
    if (history.length > 0) {
      const prevIndex = history[history.length - 1]
      setHistory(prev => prev.slice(0, -1))
      setCurrentIndex(prevIndex)
    }
  }

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") {
      handleLike()
    } else {
      goToNext()
    }
  }

  const prevApartment = history.length > 0 ? apartments[history[history.length - 1]] : undefined;
  const nextApartment = currentIndex < apartments.length - 1 ? apartments[currentIndex + 1] : undefined;

  if (isLoading) {
    return <div className="text-white text-center mt-20">Loading apartments...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-20">{error}</div>;
  }

  if (!apartments.length) {
    return <div className="text-white text-center mt-20">No apartments found</div>;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] pt-4 bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-800">
      <FilterComponent onFilterChange={handleFilterChange} />
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md mx-auto">
          {apartments.length > 0 && (
            <SwipeCard 
              apartment={apartments[currentIndex]}
              prevApartment={prevApartment}
              nextApartment={nextApartment}
              onSwipe={handleSwipe}
            />
          )}
        </div>
      </main>
      <ActionButtons 
        onAction={handleSwipe}
        onBack={history.length > 0 ? goToPrevious : undefined}
        className="bg-transparent backdrop-blur-sm"
      />
    </div>
  )
} 