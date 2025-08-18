import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, icon }) => {
  const baseClasses = "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-fuchsia-500";
  const activeClasses = "bg-black/60 text-fuchsia-400 border-b-2 border-fuchsia-400 shadow-[0_4px_14px_-4px_rgba(232,121,222,0.6)]";
  const inactiveClasses = "text-gray-400 hover:bg-black/70 hover:text-fuchsia-300";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default TabButton;