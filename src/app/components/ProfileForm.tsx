'use client';

import { useState } from 'react';
import type { ProfileFormData, UserProfile } from '../types/profile';
import { Loader2 } from 'lucide-react';

interface ProfileFormProps {
  initialData: UserProfile | null;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
}

export function ProfileForm({ initialData, onSubmit, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: initialData?.full_name || '',
    phone_number: initialData?.phone_number || '',
    date_of_birth: initialData?.date_of_birth || '',
    current_address: initialData?.current_address || '',
    bio: initialData?.bio || '',
    occupation: initialData?.occupation || '',
    monthly_income: initialData?.monthly_income || 0,
    preferred_locations: initialData?.preferred_locations || [],
    max_budget: initialData?.max_budget || 0
  });



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'monthly_income' || name === 'max_budget') {
      const numericValue = value.replace(/[^0-9.]/g, '');
      const parsedValue = numericValue ? parseFloat(numericValue) : 0;
      setFormData(prev => ({
        ...prev,
        [name]: parsedValue
      }));
    } else if (name === 'preferred_locations') {
      const locations = value.split(',').map(loc => loc.trim()).filter(Boolean);
      setFormData(prev => ({
        ...prev,
        preferred_locations: locations
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getPreferredLocations = (locations: string[] | undefined) => {
    return locations || [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isSubmitting = false; // This should be replaced with actual submission state

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-200 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                     transition-colors"
            required
          />
        </div>

        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-200 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                     transition-colors"
            required
          />
        </div>

        <div>
          <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-200 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            id="date_of_birth"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                     transition-colors"
            required
          />
        </div>

        <div>
          <label htmlFor="current_address" className="block text-sm font-medium text-gray-200 mb-2">
            Current Address
          </label>
          <input
            type="text"
            id="current_address"
            name="current_address"
            value={formData.current_address}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                     transition-colors"
            required
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-200 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                     transition-colors"
          />
        </div>

        <div>
          <label htmlFor="occupation" className="block text-sm font-medium text-gray-200 mb-2">
            Occupation
          </label>
          <input
            type="text"
            id="occupation"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                     transition-colors"
            required
          />
        </div>

        <div>
          <label htmlFor="monthly_income" className="block text-sm font-medium text-gray-200 mb-2">
            Monthly Income
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="text"
              inputMode="numeric"
              id="monthly_income"
              name="monthly_income"
              value={formData.monthly_income.toString()}
              onChange={handleChange}
              placeholder="0"
              className="w-full pl-8 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                       transition-colors"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="preferred_locations" className="block text-sm font-medium text-gray-200 mb-2">
            Preferred Locations (comma-separated)
          </label>
          <input
            type="text"
            id="preferred_locations"
            name="preferred_locations"
            value={getPreferredLocations(formData.preferred_locations).join(', ')}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                     transition-colors"
            placeholder="Enter locations separated by commas"
          />
        </div>

        <div>
          <label htmlFor="max_budget" className="block text-sm font-medium text-gray-200 mb-2">
            Maximum Budget
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="text"
              inputMode="numeric"
              id="max_budget"
              name="max_budget"
              value={formData.max_budget.toString()}
              onChange={handleChange}
              placeholder="0"
              className="w-full pl-8 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                       transition-colors"
              required
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-white/10 text-white rounded-lg 
                   hover:bg-white/20 focus:outline-none focus:ring-2 
                   focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-transparent
                   transition-all transform hover:scale-105"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg
                   hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 
                   focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-transparent
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all transform hover:scale-105"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Saving...
            </span>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
} 