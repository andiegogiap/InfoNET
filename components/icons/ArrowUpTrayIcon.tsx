
import React from 'react';

const ArrowUpTrayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor" 
        className={className}
        aria-hidden="true"
    >
    <path 
        fillRule="evenodd" 
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-6.75a.75.75 0 001.5 0V5.56l1.72 1.72a.75.75 0 101.06-1.06l-3.5-3.5a.75.75 0 00-1.06 0l-3.5 3.5a.75.75 0 101.06 1.06l1.72-1.72v5.69z" 
        clipRule="evenodd" 
    />
  </svg>
);

export default ArrowUpTrayIcon;
