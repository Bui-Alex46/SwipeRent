'use client';

import { useState } from 'react';
import AuthForm from '../components/AuthForm';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

export default function AuthPage() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: { email: string; password: string; username?: string }) => {
    try {
      setError(null);
      const endpoint = data.username ? '/api/signup' : '/api/signin';
      
      const response = await fetch(`https://swiperent.onrender.com${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Authentication failed');
      }

      localStorage.setItem('token', result.token);
      window.location.href = '/';
      
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to SwipeRent</h1>
          <p className="text-cyan-200">Find your perfect home with ease</p>
        </div>

        {/* Auth Container */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full p-3">
              <LogIn className="w-6 h-6 text-white" />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg mb-6"
              role="alert"
            >
              <span className="block text-sm text-center">{error}</span>
            </motion.div>
          )}

          <AuthForm onSubmit={handleSubmit} />

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-cyan-200">
              By signing in, you agree to our{' '}
              <a href="#" className="text-cyan-400 hover:text-cyan-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-cyan-400 hover:text-cyan-300">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-cyan-200">
            Need help?{' '}
            <a href="#" className="text-cyan-400 hover:text-cyan-300">
              Contact Support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
} 