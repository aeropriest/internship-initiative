'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import GradientButton from './GradientButton';
import { ClipboardList } from 'lucide-react';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user is admin (in a real app, this would be based on authentication)
  useEffect(() => {
    // For demo purposes, we'll consider everyone an admin in development mode
    if (process.env.NODE_ENV === 'development') {
      setIsAdmin(true);
    } else {
      // In production, you would check if the user is authenticated and has admin role
      // This is just a placeholder
      const checkAdminStatus = () => {
        const adminStatus = localStorage.getItem('admin_access');
        setIsAdmin(adminStatus === 'true');
      };
      
      checkAdminStatus();
      window.addEventListener('storage', checkAdminStatus);
      return () => window.removeEventListener('storage', checkAdminStatus);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-transparent shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-0 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3" style={{ marginLeft: '-40px' }}>
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={400} 
            height={40}
            className="object-contain"
          />
        </Link>
        <div className="flex space-x-4 items-center">
          <GradientButton 
            href="/apply"
            variant="outline"
            size="md"
          >
            I'm interested!
          </GradientButton>
        </div>

      </div>
    </header>
  );
};

export default Header;