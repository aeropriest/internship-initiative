
import React from 'react';
import WavyLines from './WavyLines';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#100324] pt-20 overflow-hidden">
      <div className="relative container mx-auto px-6 py-12 text-center text-gray-400">
        <div className="mb-8">
            <h3 className="text-2xl font-bold text-white">Sean Plunkett</h3>
            <a href="mailto:sean@globaltalentsolutions.net" className="text-lg text-pink-400 hover:text-pink-300 transition-colors">
            sean@globaltalentsolutions.net
            </a>
        </div>
        <div className="flex justify-center items-center space-x-2 mb-8">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span className="font-semibold text-white">GLOBAL TALENT SOLUTIONS</span>
        </div>
        <p>&copy; {new Date().getFullYear()} 59club Academy & Global Talent Solutions. All rights reserved.</p>
      </div>
      <WavyLines />
    </footer>
  );
};

export default Footer;
