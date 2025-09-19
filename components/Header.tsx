'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    <header className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-transparent shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-0 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3">
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={400} 
            height={40}
            className="object-contain"
          />
        </Link>
        <Link 
            href="/apply" 
            className="inline-block px-6 py-3 font-semibold text-base text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            I'm Interested!
          </Link>

      </div>
    </header>
  );
};

export default Header;