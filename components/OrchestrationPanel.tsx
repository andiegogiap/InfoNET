import React from 'react';
import { Agent } from '../types';
import AgentCard from './AgentCard';
import PlayIcon from './icons/PlayIcon';
import StopIcon from './icons/StopIcon';

interface OrchestrationPanelProps {
  agents: Agent[];
  selectedAgents: Agent[];
  onAgentSelect: (agent: Agent) => void;
  isConversing: boolean;
  onStart: (prompt: string, turns: number, autoPlay: boolean) => void;
  onStop: () => void;
}

const AGENTS_PER_PAGE = 4;

const OrchestrationPanel: React.FC<OrchestrationPanelProps> = ({
  agents,
  selectedAgents,
  onAgentSelect,
  isConversing,
  onStart,
  onStop
}) => {
  const [prompt, setPrompt] = React.useState('the future of artificial intelligence');
  const [turns, setTurns] = React.useState(5);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [autoPlay, setAutoPlay] = React.useState(true);

  const handleStart = () => {
    if (selectedAgents.length === 2 && prompt.trim() !== '') {
      onStart(prompt, turns, autoPlay);
    }
  };
  
  const totalPages = Math.ceil(agents.length / AGENTS_PER_PAGE);
  const currentAgents = agents.slice((currentPage - 1) * AGENTS_PER_PAGE, currentPage * AGENTS_PER_PAGE);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* --- Control Panel --- */}
      <div className="glass p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">Conversation Setup</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-400 mb-2">
              Initial Prompt / Topic
            </label>
            <input
              type="text"
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-md py-2 px-3 text-white focus:ring-fuchsia-500 focus:border-fuchsia-500 transition"
              placeholder="e.g., The meaning of loyalty"
            />
          </div>
          <div>
            <label htmlFor="turns" className="block text-sm font-medium text-gray-400 mb-2">
              Turns per Agent ({turns})
            </label>
            <input
              type="range"
              id="turns"
              min="1"
              max="10"
              value={turns}
              onChange={(e) => setTurns(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
              <input
                  id="autoplay-checkbox"
                  type="checkbox"
                  checked={autoPlay}
                  onChange={(e) => setAutoPlay(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-600 bg-neutral-800 text-fuchsia-500 focus:ring-fuchsia-600 accent-fuchsia-500"
              />
              <label htmlFor="autoplay-checkbox" className="ml-2 block text-sm text-gray-300">
                  Auto-play Audio
              </label>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-gray-400 text-sm text-right">
                {selectedAgents.length === 0 ? "Select 2 agents to begin." : selectedAgents.length === 1 ? `Select one more agent. ${selectedAgents[0].name} is waiting.` : `Ready: ${selectedAgents[0].name} vs ${selectedAgents[1].name}.`}
            </div>
            {!isConversing ? (
                <button
                onClick={handleStart}
                disabled={selectedAgents.length !== 2}
                className="flex items-center gap-2 bg-fuchsia-500 hover:bg-fuchsia-400 disabled:bg-gray-800 disabled:cursor-not-allowed text-black font-extrabold py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-[0_0_18px_rgba(217,70,239,0.5)]"
                >
                <PlayIcon className="h-5 w-5" />
                Start Conversation
                </button>
            ) : (
                <button
                onClick={onStop}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-[0_0_18px_rgba(220,38,38,0.6)]"
                >
                <StopIcon className="h-5 w-5" />
                Stop Conversation
                </button>
            )}
          </div>
        </div>
      </div>

      {/* --- Agent Selection --- */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">Select Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentAgents.map((agent) => (
            <AgentCard
              key={agent.name}
              agent={agent}
              isSelected={selectedAgents.some(a => a.name === agent.name)}
              onSelect={onAgentSelect}
            />
          ))}
        </div>
         {totalPages > 1 && (
            <div className="mt-4 flex justify-center items-center gap-4">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-neutral-800/70 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700/90 transition"
                >
                    Previous
                </button>
                <span className="text-gray-400 text-sm">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-neutral-800/70 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700/90 transition"
                >
                    Next
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default OrchestrationPanel;