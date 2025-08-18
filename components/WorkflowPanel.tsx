import React, { useRef, useEffect } from 'react';
import { Workflow, Message, Agent } from '../types';
import PlayIcon from './icons/PlayIcon';
import StopIcon from './icons/StopIcon';
import ArrowDownTrayIcon from './icons/ArrowDownTrayIcon';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import ArrowRightCircleIcon from './icons/ArrowRightCircleIcon';

interface WorkflowPanelProps {
  workflow: Workflow;
  messages: Message[];
  agents: Agent[];
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
}

const WorkflowPanel: React.FC<WorkflowPanelProps> = ({ workflow, messages, agents, isRunning, onStart, onStop }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  const getAgent = (agentName: string): Agent | undefined => {
    if (agentName.toUpperCase() === 'ANDIE') {
      return agents.find(a => a.name === 'Andoy');
    }
    if (agentName === 'SYSTEM' || agentName === 'USER') {
        return undefined;
    }
    return agents.find(a => a.name.toUpperCase() === agentName.toUpperCase());
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* --- Header & Controls --- */}
      <div className="bg-black/60 backdrop-blur-md p-6 rounded-lg shadow-xl border border-gray-800 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{workflow.meta.flow_name}</h2>
          <p className="text-gray-400 max-w-2xl">{workflow.meta.description}</p>
        </div>
        {!isRunning ? (
          <button
            onClick={onStart}
            className="flex items-center gap-2 bg-fuchsia-500 hover:bg-fuchsia-400 text-black font-extrabold py-2 px-4 rounded-lg transition-all duration-300 flex-shrink-0 hover:shadow-[0_0_18px_rgba(217,70,239,0.5)]"
          >
            <PlayIcon className="h-5 w-5" />
            Start Workflow
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex-shrink-0 hover:shadow-[0_0_18px_rgba(220,38,38,0.6)]"
          >
            <StopIcon className="h-5 w-5" />
            Stop Workflow
          </button>
        )}
      </div>

      {/* --- Conversation Log --- */}
      <div className="bg-black/50 p-4 rounded-lg shadow-inner border border-gray-800 min-h-[50vh] flex flex-col">
        {messages.length === 0 && !isRunning && (
            <div className="flex-grow flex items-center justify-center text-gray-600">
                <p>Click "Start Workflow" to begin the simulation.</p>
            </div>
        )}
        <div ref={scrollRef} className="space-y-5 overflow-y-auto flex-grow p-2">
          {messages.map((msg, index) => {
             const agent = getAgent(msg.agentName);
             const isSystem = !agent || !msg.step;

             if (isSystem) {
                 return (
                    <div key={index} className="flex justify-center">
                        <div className="p-2 px-4 rounded-lg bg-neutral-800/80 text-center italic text-sm text-gray-300">
                            {msg.text}
                        </div>
                    </div>
                 );
             }

             const genderColorClass = agent.gender === 'Male' ? 'border-sky-400' : 'border-pink-400';
             const genderTextClass = agent.gender === 'Male' ? 'text-sky-300' : 'text-pink-300';

             return (
                <div key={index} className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center bg-neutral-800 border-2 ${genderColorClass}`}>
                    <span className="text-white font-bold text-xl">{msg.agentName.charAt(0)}</span>
                  </div>
                  <div className="flex-grow bg-neutral-900/80 rounded-lg border border-neutral-800 shadow-md overflow-hidden">
                    <div className={`p-3 border-b border-neutral-800`}>
                        <p className={`font-bold text-lg ${genderTextClass}`}>{msg.agentName}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">{agent.role}</p>
                    </div>
                    <div className="p-3 bg-black/40">
                        <p className="text-sm text-gray-400 font-mono">STEP {msg.step.id}: {msg.step.name}</p>
                        <div className="mt-3 space-y-2 text-sm font-mono">
                            <div className="flex items-center gap-2 text-lime-400">
                                <ArrowDownTrayIcon className="h-5 w-5 flex-shrink-0" />
                                <span><span className="font-semibold text-gray-400">INPUT:</span> {msg.step.input}</span>
                            </div>
                            <div className="flex items-center gap-2 text-amber-400">
                                <ArrowUpTrayIcon className="h-5 w-5 flex-shrink-0" />
                                <span><span className="font-semibold text-gray-400">OUTPUT:</span> {msg.step.output}</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-3">
                        <p className="text-gray-200 whitespace-pre-wrap italic">"{msg.text}"</p>
                    </div>
                     {msg.step.handover_to && (
                        <div className="p-3 border-t border-neutral-800 bg-black/40">
                            <div className="flex items-center gap-2 text-sky-400 text-sm">
                                <ArrowRightCircleIcon className="h-5 w-5 flex-shrink-0" />
                                <span>HANDOVER TO: <span className="font-bold">{msg.step.handover_to}</span></span>
                            </div>
                        </div>
                    )}
                  </div>
                </div>
            )
          })}
          {isRunning && messages.length > 0 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-fuchsia-400"></div>
              <span className="text-fuchsia-400 text-sm">Workflow in progress...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowPanel;