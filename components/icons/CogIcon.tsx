
import React from 'react';

const CogIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    <path d="M12 2v2" />
    <path d="M12 22v-2" />
    <path d="m17 7 1.4-1.4" />
    <path d="m5.6 18.4 1.4-1.4" />
    <path d="M22 12h-2" />
    <path d="M4 12H2" />
    <path d="m17 17-1.4 1.4" />
    <path d="m5.6 5.6 1.4 1.4" />
  </svg>
);

export default CogIcon;
