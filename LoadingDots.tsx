import React from 'react';

const LoadingDots: React.FC = () => {
  return (
    <div className="flex items-center space-x-1.5">
      <div className="w-2 h-2 bg-[var(--accent-cyan)] rounded-full animate-[bounce_1s_infinite]"></div>
      <div className="w-2 h-2 bg-[var(--accent-cyan)] rounded-full animate-[bounce_1s_infinite_0.2s]"></div>
      <div className="w-2 h-2 bg-[var(--accent-cyan)] rounded-full animate-[bounce_1s_infinite_0.4s]"></div>
       <style>{`
        @keyframes bounce {
          0%, 100% { transform: scale(0.5); opacity: 0.5; }
          50% { transform: scale(1.0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoadingDots;