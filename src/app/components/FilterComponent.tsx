"use client"

import { useState } from 'react'
import { Sliders, X } from 'lucide-react'

interface FilterProps {
  onFilterChange: (filters: FilterParams) => void;
}

interface FilterParams {
  location?: string;
  prices?: { min?: number; max?: number };
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string[];
  pets?: ('cats' | 'dogs' | 'no_pets_allowed')[];
}

export function FilterComponent({ onFilterChange }: FilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({
    location: '',
    prices: { min: undefined, max: undefined },
    bedrooms: undefined,
    bathrooms: undefined,
    propertyType: [],
    pets: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Enhanced Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-4 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 
                 rounded-full text-white hover:from-cyan-600 hover:to-blue-600 
                 transition-all transform hover:scale-105 shadow-lg flex items-center 
                 gap-2 z-50 backdrop-blur-sm"
      >
        <Sliders className="w-5 h-5" />
        <span className="font-medium">Filters</span>
        
        {/* Optional: Add a pulsing effect to draw attention */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full" />
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-80 bg-gray-900/95 backdrop-blur-md p-6 
                      shadow-xl border-l border-white/10 overflow-y-auto z-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Filters</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 
                         text-white placeholder-white/60 focus:outline-none focus:ring-2 
                         focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter city, state"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Price Range
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={filters.prices?.min || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    prices: { ...filters.prices, min: Number(e.target.value) }
                  })}
                  className="w-1/2 bg-white/10 border border-white/20 rounded-lg px-4 py-2 
                           text-white placeholder-white/60 focus:outline-none focus:ring-2 
                           focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={filters.prices?.max || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    prices: { ...filters.prices, max: Number(e.target.value) }
                  })}
                  className="w-1/2 bg-white/10 border border-white/20 rounded-lg px-4 py-2 
                           text-white placeholder-white/60 focus:outline-none focus:ring-2 
                           focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Apply Filters Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg 
                       py-2 px-4 hover:from-cyan-600 hover:to-blue-600 transition-all transform 
                       hover:scale-[1.02]"
            >
              Apply Filters
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 