
import React from 'react';
import { CustomInstructions } from '../types';

interface CustomInstructionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  aiSupervisorInstruction: string;
  setAiSupervisorInstruction: (value: string) => void;
  systemOrchestratorInstruction: string;
  setSystemOrchestratorInstruction: (value: string) => void;
}

const CustomInstructionsPanel: React.FC<CustomInstructionsPanelProps> = ({
  isOpen,
  onClose,
  onSave,
  aiSupervisorInstruction,
  setAiSupervisorInstruction,
  systemOrchestratorInstruction,
  setSystemOrchestratorInstruction
}) => {
  const handleSave = () => {
    onSave();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-neutral-900/95 backdrop-blur-lg border-l border-fuchsia-500/40 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="instructions-heading"
      >
        <div className="h-full flex flex-col p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 id="instructions-heading" className="text-2xl font-bold text-white">Custom Instructions</h2>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-neutral-700 transition focus:outline-none focus:ring-2 focus:ring-fuchsia-500">
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="bg-fuchsia-500/10 border-l-4 border-fuchsia-400 text-fuchsia-200 p-4 rounded-r-lg" role="alert">
            <p className="font-bold">Instructions Guide</p>
            <p className="text-sm mt-1">
              <strong>AI Supervisor:</strong> Sets the persona and high-level rules for the AI agents (e.g., "be concise," "stay in character").
            </p>
            <p className="text-sm mt-1">
              <strong>System Orchestrator:</strong> Guides the topic or goal of the conversation/workflow. It's prepended to the initial prompt.
            </p>
          </div>

          <div className="flex-grow flex flex-col space-y-6 overflow-y-auto pr-2">
            <div>
              <label htmlFor="ai-supervisor" className="block text-sm font-medium text-gray-300 mb-2">
                AI Supervisor Instruction
              </label>
              <textarea
                id="ai-supervisor"
                rows={10}
                value={aiSupervisorInstruction}
                onChange={(e) => setAiSupervisorInstruction(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md py-2 px-3 text-white focus:ring-fuchsia-500 focus:border-fuchsia-500 transition font-mono text-sm"
                placeholder="e.g., You are a master AI agent supervisor..."
              />
            </div>
            
            <div>
              <label htmlFor="system-orchestrator" className="block text-sm font-medium text-gray-300 mb-2">
                System Orchestrator Instruction
              </label>
              <textarea
                id="system-orchestrator"
                rows={10}
                value={systemOrchestratorInstruction}
                onChange={(e) => setSystemOrchestratorInstruction(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md py-2 px-3 text-white focus:ring-fuchsia-500 focus:border-fuchsia-500 transition font-mono text-sm"
                placeholder="e.g., The goal is a highly efficient exchange..."
              />
            </div>
          </div>

          <div className="flex-shrink-0 pt-4 border-t border-neutral-800">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 bg-fuchsia-500 hover:bg-fuchsia-400 text-black font-extrabold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-[0_0_18px_rgba(217,70,239,0.5)]"
            >
              Save & Apply Instructions
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomInstructionsPanel;
