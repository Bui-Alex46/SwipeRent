'use client';

import { useState } from 'react';
import { User, Mail, Lock, Loader2 } from 'lucide-react';

interface AuthFormProps {
  onSubmit: (data: { email: string; password: string; username?: string }) => Promise<void>;
}

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUpperCase: true,
  hasLowerCase: true,
  hasNumber: true,
  hasSpecialChar: true
};

function validatePassword(password: string) {
  const errors = [];
  
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }
  if (PASSWORD_REQUIREMENTS.hasUpperCase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (PASSWORD_REQUIREMENTS.hasLowerCase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (PASSWORD_REQUIREMENTS.hasNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (PASSWORD_REQUIREMENTS.hasSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors;
}

export default function AuthForm({ onSubmit }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        const errors = validatePassword(formData.password);
        if (errors.length > 0) {
          setPasswordErrors(errors);
          return;
        }
      }
      
      setPasswordErrors([]);
      await onSubmit({
        email: formData.email,
        password: formData.password,
        ...(isSignUp && { username: formData.username })
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 
                       text-white placeholder-white/60 focus:outline-none focus:ring-2 
                       focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm"
              required
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 
                     text-white placeholder-white/60 focus:outline-none focus:ring-2 
                     focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 
                     text-white placeholder-white/60 focus:outline-none focus:ring-2 
                     focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm"
            required
          />
          {isSignUp && passwordErrors.length > 0 && (
            <div className="mt-2 text-sm text-red-200">
              <ul className="list-disc pl-5">
                {passwordErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {isSignUp && (
            <div className="mt-2 text-xs text-cyan-200">
              Password must:
              <ul className="list-disc pl-5">
                <li>Be at least 8 characters long</li>
                <li>Contain at least one uppercase letter</li>
                <li>Contain at least one lowercase letter</li>
                <li>Contain at least one number</li>
                <li>Contain at least one special character (!@#$%^&*)</li>
              </ul>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg 
                   py-3 px-4 font-medium hover:from-cyan-600 hover:to-blue-600 
                   focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 
                   focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all transform hover:scale-[1.02]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              {isSignUp ? 'Creating Account...' : 'Signing In...'}
            </span>
          ) : (
            <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-cyan-200 hover:text-cyan-100 text-sm focus:outline-none"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </form>
    </div>
  );
} 