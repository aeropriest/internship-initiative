
import React from 'react';

const WavyLines: React.FC = () => {
  return (
    <svg className="w-full h-32 md:h-40 lg:h-48" viewBox="0 0 1440 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="25%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="75%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <mask id="waveMask">
            <g>
                {[...Array(25)].map((_, i) => (
                    <path
                        key={i}
                        d={`M -300 ${30 + i * 12} C 400 ${-40 + i*8}, 800 ${120 - i*6}, 1900 ${30 + i * 12}`}
                        stroke="white"
                        strokeWidth="2"
                        fill="none"
                        opacity={0.8 - i * 0.02}
                    >
                        <animateTransform
                            attributeName="transform"
                            type="translate"
                            values="-150,0; 150,0; -150,0"
                            dur={`${18 + i*0.7}s`}
                            repeatCount="indefinite"
                        />
                    </path>
                ))}
            </g>
        </mask>
      </defs>
      <rect x="0" y="0" width="1440" height="300" fill="url(#waveGradient)" mask="url(#waveMask)" />
    </svg>
  );
};

export default WavyLines;
