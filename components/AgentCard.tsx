import React from 'react';
import { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (agent: Agent) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, isSelected, onSelect }) => {
  const genderColor = agent.gender === 'Male' ? 'border-sky-400' : 'border-pink-400';
  const genderShadow = agent.gender === 'Male' ? 'shadow-[inset_4px_0_10px_rgba(56,189,248,0.4)]' : 'shadow-[inset_4px_0_10px_rgba(236,72,153,0.4)]';
  
  const selectionClasses = isSelected 
    ? 'ring-2 ring-offset-2 ring-offset-black ring-fuchsia-500 scale-105 shadow-fuchsia-500/50 shadow-lg' 
    : 'hover:scale-102';

  return (
    <div
      onClick={() => onSelect(agent)}
      className={`glass p-4 rounded-lg border-l-4 ${genderColor} ${genderShadow} cursor-pointer transform transition-all duration-300 ${selectionClasses}`}
    >
      <div className="flex justify-between items-start">
        <div>
            <h3 className="text-lg font-bold text-white">{agent.name}</h3>
            <p className="text-sm text-fuchsia-400">{agent.role}</p>
        </div>
        <span className={`text-xs font-semibold ${agent.gender === 'Male' ? 'text-sky-400' : 'text-pink-400'}`}>
            {agent.gender}
        </span>
      </div>
      <p className="text-gray-400 italic mt-2 text-sm">"{agent.voice_style}"</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {agent.tags.map(tag => (
          <span key={tag} className="bg-neutral-800 text-neutral-300 text-xs font-mono px-2 py-1 rounded-full">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AgentCard;