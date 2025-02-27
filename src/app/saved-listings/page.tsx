'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SavedApartmentCard } from '../components/SavedApartmentCard';
import { motion } from 'framer-motion';
import { Heart, AlertCircle } from 'lucide-react';
import type { Apartment } from '../types/apartment';

export default function SavedListingsPage() {
  const [savedApartments, setSavedApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSavedApartments();
  }, []);

  const fetchSavedApartments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      const response = await fetch('http://localhost:3001/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch saved apartments');
      }

      const data = await response.json();
      const transformedData = data.map((apartment: Apartment) => ({
        ...apartment,
        photos: apartment.photos || [
          { href: apartment.imageUrl },
          ...(apartment.additionalImages || []).map((url: string) => ({ href: url }))
        ]
      }));

      setSavedApartments(transformedData);
    } catch (err) {
      setError('Failed to load saved apartments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-800">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-2 rounded-full bg-white/10 backdrop-blur-sm mb-4">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Saved Listings</h1>
            <p className="text-cyan-200">Your favorite apartments all in one place</p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-lg bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-200"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            </motion.div>
          )}

          {/* Saved Apartments Grid */}
          {savedApartments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedApartments.map((apartment) => (
                <motion.div
                  key={apartment.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <SavedApartmentCard
                    apartment={apartment}
                    onRemove={() => {
                      setSavedApartments(prev => 
                        prev.filter(a => a.id !== apartment.id)
                      );
                    }}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl"
            >
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                No Saved Listings Yet
              </h3>
              <p className="text-cyan-200 mb-6">
                Start saving apartments you like and they'll appear here
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg
                         hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 
                         focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900
                         transition-all transform hover:scale-105"
              >
                Find Apartments
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 