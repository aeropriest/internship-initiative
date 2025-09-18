
import React from 'react';

const WavyLines: React.FC = () => {
  return (
    <svg className="w-full" viewBox="0 0 1440 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <mask id="waveMask">
            <g>
                {[...Array(20)].map((_, i) => (
                    <path
                        key={i}
                        d={`M -200 ${10 + i * 7} C 400 ${-20 + i*5}, 800 ${60 - i*3}, 1800 ${10 + i * 7}`}
                        stroke="white"
                        strokeWidth="1.5"
                        fill="none"
                    >
                        <animateTransform
                            attributeName="transform"
                            type="translate"
                            values="-100,0; 100,0; -100,0"
                            dur={`${15 + i*0.5}s`}
                            repeatCount="indefinite"
                        />
                    </path>
                ))}
            </g>
        </mask>
      </defs>
      <rect x="0" y="0" width="1440" height="150" fill="url(#waveGradient)" mask="url(#waveMask)" />
    </svg>
  );
};

export default WavyLines;
