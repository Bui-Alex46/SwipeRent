"use client"

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, User, LogOut,  Heart, Layout, Scan, } from 'lucide-react';
import { FilterComponent } from './FilterComponent';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check auth status
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.location.href = '/auth';
  };

  // Don't render anything while checking auth status
  if (isLoading) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home Link */}
          <Link href="/" className="text-white text-xl font-bold">
            SwipeRent
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="text-white hover:text-gray-200 px-3 py-2 rounded-md flex items-center"
                >
                  <User className="w-5 h-5 mr-1" />
                  Account
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>

                {/* Dropdown Menu - Added higher z-index and pointer-events-auto */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-sm rounded-md shadow-lg py-1 border border-white/10 z-[100] pointer-events-auto">

                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <Link
                      href="/swipe"
                      className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Scan className="w-4 h-4 mr-2" />
                      Swipe
                    </Link>
                    <Link
                      href="/saved-listings"
                      className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Saved Listings
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Layout className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                    
                   
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/auth"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel Modal - Updated */}
      {filterOpen && (
        <div className="fixed inset-0 z-[150] overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setFilterOpen(false)}
          />
          
          {/* Panel */}
          <div className="relative min-h-screen md:flex md:items-center md:justify-center p-4">
            <div className="relative bg-gray-900/95 rounded-2xl p-6 max-w-lg w-full mx-auto mt-16 md:mt-0 border border-white/10 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Filters</h2>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <FilterComponent 
                onFilterChange={(filters) => {
                  setFilterOpen(false);
                  window.dispatchEvent(new CustomEvent('applyFilters', { detail: filters }));
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white/10 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/swipe"
              className="flex items-center text-gray-300 hover:text-white block px-3 py-2"
              onClick={() => setIsOpen(false)}
            >
              <Scan className="w-5 h-5 mr-2" />
              Swipe
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center text-gray-300 hover:text-white block px-3 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-5 h-5 mr-2" />
                  Profile
                </Link>
                <Link
                  href="/saved-listings"
                  className="flex items-center text-gray-300 hover:text-white block px-3 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Saved Listings
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center text-gray-300 hover:text-white block px-3 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Layout className="w-5 h-5 mr-2" />
                  Dashboard
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-gray-300 hover:text-white px-3 py-2"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="text-gray-300 hover:text-white block px-3 py-2"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

