'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-sm shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          59<span className="text-pink-500">club</span> <span className="font-light text-gray-500">Academy</span>
        </Link>
        <Link 
          href="/apply" 
          className="relative inline-block px-6 py-2 font-medium text-white group"
        >
            <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform -translate-x-2 -translate-y-2 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:translate-x-0 group-hover:translate-y-0 rounded-lg"></span>
            <span className="absolute inset-0 w-full h-full border-2 border-white rounded-lg"></span>
            <span className="relative">Express Interest</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;