'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import GradientButton from './GradientButton';

const Hero: React.FC = () => {
  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="/hero-golf.png"
        alt="Golf course with professional golfer - Global Internship Initiative"
        fill
        className="object-cover"
        priority
        quality={90}
      />
      
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-black/30 z-10"></div>

      <div className="relative z-20 container mx-auto px-6 text-left">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white leading-tight">
            Global
          </h1>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white leading-tight my-2">
            Internship
          </h1>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white leading-tight">
            Initiative
          </h1>
          
          <div className="mt-12">
            <GradientButton 
              href="/apply"
              variant="outline"
              size="lg"
            >
              I'm Interested!
            </GradientButton>
          </div>
          
          <div className="mt-20 flex items-center space-x-2 text-gray-400">
            <span>Powered by</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span className="font-semibold text-white">GLOBAL TALENT SOLUTIONS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;