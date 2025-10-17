import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-cyan)" />
                    <stop offset="100%" stopColor="var(--accent-blue)" />
                </linearGradient>
            </defs>
            <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="url(#logo-gradient)" fillOpacity="0.2"/>
            <path d="M12 2L2 12L12 22L22 12L12 2Z" stroke="url(#logo-gradient)" strokeWidth="1.5"/>
            <path d="M7 12L12 7L17 12L12 17L7 12Z" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
        <span className="text-2xl font-bold text-white font-heading">VSAI</span>
    </div>
  );
};

export default Logo;