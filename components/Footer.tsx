
import React from 'react';
import WavyLines from './WavyLines';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gradient-to-b from-[#100324] to-[#1a0a3a] overflow-hidden">
      {/* Wavy lines as background */}
      <div className="absolute inset-0 opacity-20">
        <WavyLines />
      </div>
      
      <div className="relative z-10 container mx-auto px-6 py-16 text-center text-gray-400">
        <div className="mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Sean Plunkett</h3>
            <a href="mailto:sean@globaltalentsolutions.net" className="text-xl text-pink-400 hover:text-pink-300 transition-colors">
            sean@globaltalentsolutions.net
            </a>
        </div>
        
        <div className="flex justify-center items-center space-x-3 mb-12">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span className="font-bold text-xl text-white">GLOBAL TALENT SOLUTIONS</span>
        </div>
        
        <div className="border-t border-gray-600 pt-8">
          <p className="text-gray-300">&copy; {new Date().getFullYear()} 59club Academy & Global Talent Solutions. All rights reserved.</p>
        </div>
      </div>
      
      {/* Additional wavy lines at bottom */}
      {/* <div className="absolute bottom-0 left-0 right-0">
        <WavyLines />
      </div> */}
    </footer>
  );
};

export default Footer;
