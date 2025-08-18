import React, { useEffect, useRef, useState } from 'react';
import { Agent, Message, VoiceConfig } from '../types';
import CopyIcon from './icons/CopyIcon';
import PlayIcon from './icons/PlayIcon';

// This is a simplified TTS call signature for props
type SpeakFunction = (text: string, voiceConfig: VoiceConfig) => void;

interface MessageBubbleProps {
  message: Message;
  agent: Agent;
  onPlay: SpeakFunction;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, agent, onPlay }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const isSystem = agent.name === 'SYSTEM';

  return (
     <div className={`group relative flex ${isSystem ? '' : 'w-full'}`}>
        <div className={`p-3 rounded-lg max-w-full ${isSystem ? 'bg-white/5' : 'bg-black/20'}`}>
            <p className="text-gray-200 whitespace-pre-wrap">{message.text}</p>
        </div>
        <div className="absolute top-0 right-0 flex items-center space-x-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 rounded-bl-md rounded-tr-md">
            <button onClick={() => onPlay(message.text, agent.voice)} className="text-gray-300 hover:text-fuchsia-400">
                <PlayIcon className="h-4 w-4" />
            </button>
            <button onClick={handleCopy} className="text-gray-300 hover:text-fuchsia-400">
                {copied ? <span className="text-xs text-lime-400 font-semibold">Copied!</span> : <CopyIcon className="h-4 w-4" />}
            </button>
        </div>
    </div>
  );
};


interface AgentPaneProps {
  agent: Agent | null; 
  messages: Message[];
  onPlay: SpeakFunction;
}

const AgentPane: React.FC<AgentPaneProps> = ({ agent, messages, onPlay }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!agent) return null;

  return (
    <div className="glass rounded-lg shadow-inner h-full flex flex-col">
      <div className={`p-4 border-b-2 ${agent.gender === 'Male' ? 'border-sky-400' : 'border-pink-400'}`}>
        <h3 className="text-xl font-bold text-white font-orbitron">{agent.name}</h3>
        <p className="text-sm text-fuchsia-400">{agent.role}</p>
      </div>
      <div ref={scrollRef} className="p-4 space-y-4 overflow-y-auto flex-grow">
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} agent={agent} onPlay={onPlay} />
        ))}
      </div>
    </div>
  );
};


interface ConversationViewProps {
  messages: Message[];
  agent1: Agent | null;
  agent2: Agent | null;
  systemAgent: Agent | null;
  isConversing: boolean;
  onPlay: SpeakFunction;
}


const ConversationView: React.FC<ConversationViewProps> = ({ messages, agent1, agent2, systemAgent, isConversing, onPlay }) => {
  if (!agent1 || !agent2) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 animate-fade-in">
        <p>Go to the 'Orchestration' tab to select agents and start a conversation.</p>
      </div>
    );
  }

  const agent1Messages = messages.filter(m => m.agentName === agent1.name);
  const agent2Messages = messages.filter(m => m.agentName === agent2.name);
  const systemMessages = messages.filter(m => m.agentName === 'SYSTEM' || m.agentName === 'USER');

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
       {systemMessages.length > 0 && (
         <div className="glass p-3 rounded-lg space-y-2">
          {systemMessages.map((msg, i) =>
            systemAgent ? (
              <div key={i} className="flex justify-center">
                 <MessageBubble message={msg} agent={systemAgent} onPlay={onPlay} />
              </div>
            ) : (
               <p key={i} className="text-center text-sm text-gray-400 italic">
                {msg.text}
              </p>
            )
          )}
          {isConversing && (
             <div className="flex justify-center items-center gap-2 mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-fuchsia-400"></div>
                <span className="text-fuchsia-400 text-sm">Conversation in progress...</span>
             </div>
          )}
        </div>
       )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow h-0 min-h-[50vh]">
        <AgentPane agent={agent1} messages={agent1Messages} onPlay={onPlay} />
        <AgentPane agent={agent2} messages={agent2Messages} onPlay={onPlay} />
      </div>
    </div>
  );
};

export default ConversationView;