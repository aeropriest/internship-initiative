'use client';

import React from 'react';
import Image from 'next/image';
import GradientButton from './GradientButton';

const Hero: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <Image
        src="/hero-couple.jpg"
        alt="Golf course with professional golfer - Global Internship Initiative"
        fill
        className="object-cover object-left-center"
        priority
        quality={100}
      />
      
      {/* Gradient overlay: darker black on left, lighter towards right */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 z-10"></div>

      {/* Main content container - bottom aligned */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="container mx-auto px-8 pb-16">
          <div className="max-w-3xl " style={{ marginLeft: '-40px' }} >
            
            {/* Main heading with tighter line spacing */}
            <h1 className="text-7xl md:text-8xl font-semibold text-white tracking-tight">
              Global Internship Initiative
            </h1>
            
            {/* Subheading with reduced spacing */}
            <div className="mt-6 mb-8">
              <h2 className="text-xl md:text-3xl font-thin text-gray-200 leading-snug max-w-xl">
                Connecting passionate graduates with leading clubs worldwide
              </h2>
              {/* <p className="text-lg md:text-xl text-gray-300 mt-3 max-w-lg leading-relaxed">
                A structured international pathway for aspiring hospitality professionals and a reliable talent pipeline for premier clubs.
              </p> */}
            </div>
            
            {/* Button */}
            <div className="mb-8">
              <GradientButton 
                href="/apply"
                variant="outline"
                size="lg"
              >
                I'm Interested!
              </GradientButton>
            </div>
            <div className="z-30 flex items-center space-x-1 text-gray-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                  <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span className="font-thin text-sm text-white">GLOBAL TALENT SOLUTIONS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
