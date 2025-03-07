'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileForm } from '../components/ProfileForm';
import { UserProfile } from '../types/profile';
import { motion } from 'framer-motion';
import { User, Phone, Calendar, MapPin, Briefcase, DollarSign, Home, Upload, LucideIcon} from 'lucide-react';
import Link from 'next/link';


export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    try {
      console.log('Fetching profile...');
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      const response = await fetch('http://localhost:3001/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Profile response status:', response.status);
      const data = await response.json();
      console.log('Profile data:', data);

      if (response.ok) {
        setProfile(data);
      } else {
        console.error('Failed to fetch profile:', data.error);
        
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
     
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="min-h-screen pt-10 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!profile || isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-800 pt-10">
        <div className="container mx-auto px-4">
          <ProfileForm
            initialData={profile}
            onCancel={() => setIsEditing(false)}
            onSubmit={async (data) => {
              try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3001/api/profile', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(data)
                });

                if (response.ok) {
                  const updatedProfile = await response.json();
                  setProfile(updatedProfile);
                  setIsEditing(false);
                }
              } catch (err) {
                console.error('Failed to save profile:', err);
              }
            }}
          />
        </div>
      </div>
    );
  }

  // Profile View Mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-800 pt-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl"
        >
          {/* Header */}
          <div className="p-8 text-center border-b border-white/10">
            <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{profile.full_name}</h1>
            <p className="text-cyan-200">{profile.occupation}</p>
          </div>

          {/* Profile Information */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileItem icon={Phone} label="Phone" value={profile.phone_number} />
              <ProfileItem 
                icon={Calendar} 
                label="Date of Birth" 
                value={formatDate(profile.date_of_birth)} 
              />
              <ProfileItem icon={MapPin} label="Current Address" value={profile.current_address} />
              <ProfileItem icon={Briefcase} label="Occupation" value={profile.occupation} />
              <ProfileItem 
                icon={DollarSign} 
                label="Monthly Income" 
                value={profile.monthly_income ? profile.monthly_income.toString() : null} 
              />
              <ProfileItem 
                icon={Home} 
                label="Maximum Budget" 
                value={profile.max_budget ? profile.max_budget.toString() : null} 
              />
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-3">Preferred Locations</h3>
              <div className="flex flex-wrap gap-2">
                {profile.preferred_locations?.map((location, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-white/10 rounded-full text-cyan-200 text-sm"
                  >
                    {location}
                  </span>
                )) || (
                  <span className="text-gray-400">No preferred locations specified</span>
                )}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-3">Bio</h3>
              <p className="text-gray-300">{profile.bio}</p>
            </div>

            {/* Replace the existing buttons section with this */}
            <div className="mt-8 space-y-6">
              {/* Document Upload CTA */}
              <DocumentUploadCTA />
              
              {/* Action Buttons */}
              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg
                           hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 
                           focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-transparent
                           transition-all transform hover:scale-105"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}



function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  });
}

function ProfileItem({ icon: Icon, label, value }: { 
  icon: LucideIcon, 
  label: string, 
  value: string | number | undefined | null 
}) {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;
  return (
    <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl">
      <div className="p-2 bg-white/10 rounded-lg">
        <Icon className="w-5 h-5 text-cyan-400" />
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-white">{displayValue || 'Not specified'}</p>
      </div>
    </div>
  );
}

function DocumentUploadCTA() {
  return (
    <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Required Documents
          </h3>
          <p className="text-cyan-200 text-sm">
            To complete your application process, please upload your required documents in the dashboard:
          </p>
          <ul className="mt-2 text-sm text-gray-300 list-disc list-inside">
            <li>Proof of Income</li>
            <li>Government ID</li>
            <li>Rental History</li>
          </ul>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 
                   text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 
                   focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 
                   focus:ring-offset-transparent transition-all transform hover:scale-105"
        >
          <Upload className="w-5 h-5 mr-2" />
          Upload Documents
        </Link>
      </div>
    </div>
  );
}