import React from 'react';

const Spinner: React.FC = () => {
    return (
        <div className="w-6 h-6 animate-spin" style={{ animationDuration: '2s' }}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--accent-cyan)" />
                        <stop offset="100%" stopColor="var(--accent-blue)" />
                    </linearGradient>
                </defs>
                <path d="M12 2L2 12L12 22L22 12L12 2Z" stroke="currentColor" className="text-gray-700" strokeWidth="1.5"/>
                <path d="M12 2L2 12L12 22L22 12L12 2Z" 
                      stroke="url(#spinner-gradient)" 
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeDasharray="20 60"
                />
            </svg>
        </div>
    );
};

export default Spinner;