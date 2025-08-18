
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Agent, AppTab, Message, ApiKeys, VoiceConfig, CustomInstructions } from './types';
import { AGENTS as initialAgents, SYSTEM_AGENT_DEFAULT } from './constants';
import { MARKETING_VIDEO_WORKFLOW } from './workflow';
import { runConversation, runWorkflow } from './services/geminiService';
import { speak } from './services/ttsService';
import { dbGet, dbSet } from './services/dbService';
import TabButton from './components/TabButton';
import OrchestrationPanel from './components/OrchestrationPanel';
import ConversationView from './components/ConversationView';
import SettingsPanel from './components/SettingsPanel';
import ApiKeysPanel from './components/ApiKeysPanel';
import WorkflowPanel from './components/WorkflowPanel';
import CustomInstructionsPanel from './components/CustomInstructionsPanel';

import UsersIcon from './components/icons/UsersIcon';
import ChatIcon from './components/icons/ChatIcon';
import CogIcon from './components/icons/CogIcon';
import KeyIcon from './components/icons/KeyIcon';
import WorkflowIcon from './components/icons/WorkflowIcon';
import SlidersIcon from './components/icons/SlidersIcon';

const DEFAULT_AI_SUPERVISOR_INSTRUCTION = "You are a master AI agent supervisor. Your primary directive is to ensure the assigned AI agents stay on-topic, remain in character, and provide concise, useful, and non-repetitive responses. Enforce a high standard of quality. Do not be conversational yourself; your role is to constrain the agent's output based on its persona and the user's prompt.";
const DEFAULT_SYSTEM_ORCHESTRATOR_INSTRUCTION = "The goal is a highly efficient and professional exchange. Agents should avoid pleasantries and get straight to the point. Each response should directly address the previous message and move the conversation or workflow forward. End responses decisively.";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('orchestration');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [systemAgent, setSystemAgent] = useState<Agent | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isConversing, setIsConversing] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ gemini: '', googleCloud: '', openai: '', v0dev: '', abacus: '', elevenlabs: '', hume: ''});
  const conversationController = useRef<boolean>(false);
  const [isStateLoaded, setIsStateLoaded] = useState(false);
  
  const [workflowMessages, setWorkflowMessages] = useState<Message[]>([]);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const workflowController = useRef<boolean>(false);
  
  const [isInstructionsPanelOpen, setIsInstructionsPanelOpen] = useState(false);
  const [customInstructions, setCustomInstructions] = useState<CustomInstructions>({
      aiSupervisor: DEFAULT_AI_SUPERVISOR_INSTRUCTION,
      systemOrchestrator: DEFAULT_SYSTEM_ORCHESTRATOR_INSTRUCTION,
  });

  // Load state from IndexedDB on initial render
  useEffect(() => {
    const loadState = async () => {
      try {
        const [savedKeys, savedAgents, savedSystemAgent, savedInstructions] = await Promise.all([
            dbGet<ApiKeys>('apiKeys'),
            dbGet<Agent[]>('agents'),
            dbGet<Agent>('systemAgent'),
            dbGet<CustomInstructions>('customInstructions'),
        ]);

        if (savedKeys) {
            setApiKeys(savedKeys);
        }

        if (savedAgents && savedSystemAgent) {
            setAgents(savedAgents);
            setSystemAgent(savedSystemAgent);
        } else {
            // If no settings are found, persist the defaults
            setAgents(initialAgents);
            setSystemAgent(SYSTEM_AGENT_DEFAULT);
            await dbSet('agents', initialAgents);
            await dbSet('systemAgent', SYSTEM_AGENT_DEFAULT);
        }
        
        if (savedInstructions) {
          setCustomInstructions(savedInstructions);
        } else {
          await dbSet('customInstructions', {
              aiSupervisor: DEFAULT_AI_SUPERVISOR_INSTRUCTION,
              systemOrchestrator: DEFAULT_SYSTEM_ORCHESTRATOR_INSTRUCTION,
          });
        }

      } catch (error) {
        console.error("Failed to load state from IndexedDB", error);
        // Fallback to defaults if DB fails
        setAgents(initialAgents);
        setSystemAgent(SYSTEM_AGENT_DEFAULT);
      } finally {
        setIsStateLoaded(true);
      }
    };
    
    loadState();
  }, []);

  const handleSaveApiKeys = useCallback(async (keys: ApiKeys) => {
    setApiKeys(keys);
    await dbSet('apiKeys', keys);
  }, []);
  
  const handleSaveSettings = useCallback(async (updatedAgents: Agent[], updatedSystemAgent: Agent) => {
    setAgents(updatedAgents);
    setSystemAgent(updatedSystemAgent);
    await Promise.all([
        dbSet('agents', updatedAgents),
        dbSet('systemAgent', updatedSystemAgent)
    ]);
    // Update selected agents with new configs if they are selected
    setSelectedAgents(prev => prev.map(sa => updatedAgents.find(ua => ua.name === sa.name) || sa));
  }, []);
  
  const handleSaveInstructions = useCallback(async () => {
    await dbSet('customInstructions', customInstructions);
  }, [customInstructions]);

  const handleAgentSelect = useCallback((agent: Agent) => {
    setSelectedAgents(prev => {
      const isSelected = prev.some(a => a.name === agent.name);
      if (isSelected) {
        return prev.filter(a => a.name !== agent.name);
      }
      if (prev.length < 2) {
        return [...prev, agent];
      }
      return [prev[0], agent];
    });
  }, []);

  const handleStartConversation = useCallback(async (prompt: string, turns: number, autoPlay: boolean) => {
    if (selectedAgents.length !== 2) return;
    
    setConversation([]);
    setIsConversing(true);
    setActiveTab('conversation');
    conversationController.current = true;

    const [agent1, agent2] = selectedAgents;
    
    try {
      const conversationGenerator = runConversation(agent1, agent2, prompt, turns, customInstructions.aiSupervisor, customInstructions.systemOrchestrator);
      for await (const message of conversationGenerator) {
        if (!conversationController.current) {
            setConversation(prev => [...prev, {agentName: 'SYSTEM', text: 'Conversation manually stopped.'}]);
            break;
        }
        setConversation(prev => [...prev, message]);
      }
    } catch (error) {
      console.error("Failed to run conversation:", error);
      setConversation(prev => [...prev, { agentName: 'SYSTEM', text: 'A critical error occurred.' }]);
    } finally {
      setIsConversing(false);
      conversationController.current = false;
    }
  }, [selectedAgents, customInstructions]);

  const handleStopConversation = useCallback(() => {
    conversationController.current = false;
    setIsConversing(false);
  }, []);

  const handleStartWorkflow = useCallback(async () => {
    setWorkflowMessages([]);
    setIsWorkflowRunning(true);
    setActiveTab('workflow');
    workflowController.current = true;

    try {
      const workflowGenerator = runWorkflow(MARKETING_VIDEO_WORKFLOW, agents, customInstructions.aiSupervisor, customInstructions.systemOrchestrator);
      for await (const message of workflowGenerator) {
        if (!workflowController.current) {
          setWorkflowMessages(prev => [...prev, {agentName: 'SYSTEM', text: 'Workflow manually stopped.'}]);
          break;
        }
        setWorkflowMessages(prev => [...prev, message]);
      }
    } catch (error) {
      console.error("Failed to run workflow:", error);
      setWorkflowMessages(prev => [...prev, { agentName: 'SYSTEM', text: 'A critical error occurred during the workflow.' }]);
    } finally {
      setIsWorkflowRunning(false);
      workflowController.current = false;
    }
  }, [agents, customInstructions]);

  const handleStopWorkflow = useCallback(() => {
    workflowController.current = false;
    setIsWorkflowRunning(false);
  }, []);


  const handlePlayTTS = useCallback(async (text: string, voiceConfig: VoiceConfig) => {
    try {
      await speak(text, voiceConfig, apiKeys);
    } catch (error) {
      // Error is alerted within the service
      console.error("TTS playback failed", error);
    }
  }, [apiKeys]);
  
  const renderContent = () => {
    if (!isStateLoaded) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-400"></div>
          <span className="ml-3 text-sm">Loading persistent settings...</span>
        </div>
      );
    }

    switch (activeTab) {
      case 'orchestration':
        return <OrchestrationPanel 
                  agents={agents}
                  selectedAgents={selectedAgents} 
                  onAgentSelect={handleAgentSelect}
                  isConversing={isConversing}
                  onStart={handleStartConversation}
                  onStop={handleStopConversation}
                />;
      case 'conversation':
        return <ConversationView 
                  messages={conversation} 
                  agent1={selectedAgents[0] || null} 
                  agent2={selectedAgents[1] || null} 
                  systemAgent={systemAgent}
                  isConversing={isConversing}
                  onPlay={handlePlayTTS}
                />;
      case 'workflow':
        return <WorkflowPanel
                  workflow={MARKETING_VIDEO_WORKFLOW}
                  messages={workflowMessages}
                  agents={agents}
                  isRunning={isWorkflowRunning}
                  onStart={handleStartWorkflow}
                  onStop={handleStopWorkflow}
                />;
      case 'settings':
        return <SettingsPanel agents={agents} systemAgent={systemAgent} onSave={handleSaveSettings} />;
      case 'api-keys':
        return <ApiKeysPanel apiKeys={apiKeys} onSave={handleSaveApiKeys} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-gray-200 font-sans">
       {/* Instruction Panel Trigger */}
        <button
            onClick={() => setIsInstructionsPanelOpen(true)}
            className="fixed top-1/2 -translate-y-1/2 right-0 bg-fuchsia-600/70 hover:bg-fuchsia-500/90 text-white p-3 rounded-l-lg shadow-lg z-30 transition-all backdrop-blur-sm hover:scale-105"
            aria-label="Open Custom Instructions"
        >
            <SlidersIcon className="h-6 w-6" />
        </button>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <a href="/" aria-label="Home" className="mx-auto mb-4 block w-fit">
            <img
              src="https://andiegogiap.com/assets/aionex-icon-256.png"
              alt="AIONEX"
              width="128"
              height="128"
              style={{height: '40px', width: 'auto', display: 'block'}}
              loading="eager"
              decoding="async"
            />
          </a>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            <span className="text-fuchsia-400" style={{ textShadow: '0 0 12px rgba(232, 121, 222, 1), 0 0 30px rgba(217, 70, 239, 0.7)' }}>AI-Intel</span> Infonet
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Agent-to-Agent Conversation Orchestrator
          </p>
        </header>

        <main>
          <div className="border-b border-gray-800 mb-6">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
              <TabButton label="Orchestration" isActive={activeTab === 'orchestration'} onClick={() => setActiveTab('orchestration')} icon={<UsersIcon className="h-5 w-5" />} />
              <TabButton label="Conversation" isActive={activeTab === 'conversation'} onClick={() => setActiveTab('conversation')} icon={<ChatIcon className="h-5 w-5" />} />
              <TabButton label="Workflow" isActive={activeTab === 'workflow'} onClick={() => setActiveTab('workflow')} icon={<WorkflowIcon className="h-5 w-5" />} />
              <TabButton label="Settings" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<CogIcon className="h-5 w-5" />} />
              <TabButton label="API Keys" isActive={activeTab === 'api-keys'} onClick={() => setActiveTab('api-keys')} icon={<KeyIcon className="h-5 w-5" />} />
            </nav>
          </div>

          <div className="bg-black/50 p-6 rounded-b-lg rounded-tr-lg shadow-2xl shadow-fuchsia-500/10 border border-fuchsia-500/30 min-h-[60vh] backdrop-blur-md">
            {renderContent()}
          </div>
        </main>
        
        <footer className="text-center mt-8 text-gray-700 text-sm">
            <p>&copy; {new Date().getFullYear()} AI-INTEL INFONET. Creed: Code. Loyalty. Family. Worldwide.</p>
        </footer>
      </div>

      <CustomInstructionsPanel
        isOpen={isInstructionsPanelOpen}
        onClose={() => setIsInstructionsPanelOpen(false)}
        onSave={handleSaveInstructions}
        aiSupervisorInstruction={customInstructions.aiSupervisor}
        setAiSupervisorInstruction={(val) => setCustomInstructions(prev => ({...prev, aiSupervisor: val}))}
        systemOrchestratorInstruction={customInstructions.systemOrchestrator}
        setSystemOrchestratorInstruction={(val) => setCustomInstructions(prev => ({...prev, systemOrchestrator: val}))}
    />
    </div>
  );
};

export default App;