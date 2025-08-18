import React, { useState, useEffect } from 'react';
import { Agent, VoiceConfig, TTSProvider, GoogleVoiceConfig, ElevenLabsVoiceConfig, HumeVoiceConfig, OpenAIVoiceConfig } from '../types';

const OPENAI_VOICES: OpenAIVoiceConfig['voice'][] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
const OPENAI_MODELS: OpenAIVoiceConfig['model'][] = ['tts-1', 'tts-1-hd'];

interface VoiceEditorProps {
  agent: Agent;
  onChange: (voiceConfig: VoiceConfig) => void;
}

const VoiceEditor: React.FC<VoiceEditorProps> = ({ agent, onChange }) => {
  const [voice, setVoice] = useState(agent.voice);

  useEffect(() => {
    setVoice(agent.voice);
  }, [agent.voice]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as TTSProvider;
    let newVoiceConfig: VoiceConfig;

    switch (newProvider) {
      case 'openai':
        newVoiceConfig = {
          provider: 'openai',
          settings: { model: 'tts-1', voice: 'nova' }
        };
        break;
      case 'google':
        newVoiceConfig = {
          provider: 'google',
          settings: { languageCode: 'en-US', name: 'en-US-Standard-A', pitch: 0, speakingRate: 1.0 }
        };
        break;
      case 'hume':
        newVoiceConfig = {
          provider: 'hume',
          settings: { voiceId: 'placeholder-hume-voice' }
        };
        break;
      case 'elevenlabs':
      default:
        newVoiceConfig = {
          provider: 'elevenlabs',
          settings: { voiceId: '21m00Tcm4TlvDq8ikWAM', stability: 0.5, similarity_boost: 0.75 }
        };
        break;
    }
    
    setVoice(newVoiceConfig);
    onChange(newVoiceConfig);
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'range' || name === 'pitch' || name === 'speakingRate' || name === 'stability' || name === 'similarity_boost';
    
    const parsedValue = isNumber ? parseFloat(value) : value;

    let newVoiceConfig: VoiceConfig;
    
    switch (voice.provider) {
      case 'openai':
        newVoiceConfig = {
          ...voice,
          settings: {
            ...voice.settings,
            [name]: parsedValue,
          },
        };
        break;
      case 'google':
        newVoiceConfig = {
          ...voice,
          settings: {
            ...voice.settings,
            [name]: parsedValue,
          },
        };
        break;
      case 'elevenlabs':
        newVoiceConfig = {
          ...voice,
          settings: {
            ...voice.settings,
            [name]: parsedValue,
          },
        };
        break;
      case 'hume':
        newVoiceConfig = {
          ...voice,
          settings: {
            ...voice.settings,
            [name]: parsedValue,
          },
        };
        break;
      default:
        newVoiceConfig = voice;
    }
    
    setVoice(newVoiceConfig);
    onChange(newVoiceConfig);
  };
  
  const genderColor = agent.gender === 'Male' ? 'border-sky-400' : 'border-pink-400';

  return (
    <div className={`glass p-4 rounded-lg shadow-lg border-l-4 ${genderColor}`}>
      <h3 className="text-lg font-bold text-white">{agent.name}</h3>
      <p className="text-sm text-fuchsia-400 mb-4">{agent.role}</p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor={`provider-${agent.name}`} className="block text-sm font-medium text-gray-300 mb-1">TTS Provider</label>
          <select
            id={`provider-${agent.name}`}
            value={voice.provider}
            onChange={handleProviderChange}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-md py-2 px-3 text-white focus:ring-fuchsia-500 focus:border-fuchsia-500 transition"
          >
            <option value="openai">OpenAI</option>
            <option value="elevenlabs">ElevenLabs</option>
            <option value="google">Google Cloud</option>
            <option value="hume">Hume AI</option>
          </select>
        </div>

        {voice.provider === 'openai' && (
          <>
            <div>
              <label htmlFor={`voice-${agent.name}`} className="block text-sm font-medium text-gray-300 mb-1">Voice</label>
              <select id={`voice-${agent.name}`} name="voice" value={(voice.settings as OpenAIVoiceConfig).voice} onChange={handleSettingsChange} className="w-full bg-neutral-900 border border-neutral-700 rounded-md py-2 px-3 text-white focus:ring-fuchsia-500 focus:border-fuchsia-500 transition">
                {OPENAI_VOICES.map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor={`model-${agent.name}`} className="block text-sm font-medium text-gray-300 mb-1">Model</label>
              <select id={`model-${agent.name}`} name="model" value={(voice.settings as OpenAIVoiceConfig).model} onChange={handleSettingsChange} className="w-full bg-neutral-900 border border-neutral-700 rounded-md py-2 px-3 text-white focus:ring-fuchsia-500 focus:border-fuchsia-500 transition">
                {OPENAI_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </>
        )}

        {voice.provider === 'elevenlabs' && (
          <>
            <div>
              <label htmlFor={`voiceId-${agent.name}`} className="block text-sm font-medium text-gray-300 mb-1">Voice ID</label>
              <input type="text" id={`voiceId-${agent.name}`} name="voiceId" value={(voice.settings as ElevenLabsVoiceConfig).voiceId} onChange={handleSettingsChange} className="w-full bg-neutral-900 border border-neutral-700 rounded-md py-2 px-3 text-white focus:ring-fuchsia-500 focus:border-fuchsia-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Stability ({(voice.settings as ElevenLabsVoiceConfig).stability?.toFixed(2)})</label>
              <input type="range" name="stability" min="0" max="1" step="0.05" value={(voice.settings as ElevenLabsVoiceConfig).stability} onChange={handleSettingsChange} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Similarity Boost ({(voice.settings as ElevenLabsVoiceConfig).similarity_boost?.toFixed(2)})</label>
              <input type="range" name="similarity_boost" min="0" max="1" step="0.05" value={(voice.settings as ElevenLabsVoiceConfig).similarity_boost} onChange={handleSettingsChange} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-500" />
            </div>
          </>
        )}

        {voice.provider === 'google' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Voice Name</label>
              <input type="text" name="name" value={(voice.settings as GoogleVoiceConfig).name} onChange={handleSettingsChange} className="w-full bg-neutral-900 border border-neutral-700 rounded-md py-2 px-3 text-white focus:ring-fuchsia-500 focus:border-fuchsia-500 transition" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Pitch ({(voice.settings as GoogleVoiceConfig).pitch.toFixed(1)})</label>
              <input type="range" name="pitch" min="-20" max="20" step="0.1" value={(voice.settings as GoogleVoiceConfig).pitch} onChange={handleSettingsChange} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Speaking Rate ({(voice.settings as GoogleVoiceConfig).speakingRate.toFixed(2)}x)</label>
              <input type="range" name="speakingRate" min="0.25" max="4.0" step="0.05" value={(voice.settings as GoogleVoiceConfig).speakingRate} onChange={handleSettingsChange} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-500" />
            </div>
          </>
        )}

        {voice.provider === 'hume' && (
           <div className="text-center text-gray-500 border border-dashed border-gray-700 p-3 rounded-md">
                <p className="text-sm">Hume AI voice customization is not yet available.</p>
           </div>
        )}
      </div>
    </div>
  );
};

interface SettingsPanelProps {
  agents: Agent[];
  systemAgent: Agent | null;
  onSave: (agents: Agent[], systemAgent: Agent) => void | Promise<void>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ agents, systemAgent, onSave }) => {
  const [updatedAgents, setUpdatedAgents] = useState<Agent[]>([]);
  const [updatedSystemAgent, setUpdatedSystemAgent] = useState<Agent | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setUpdatedAgents(JSON.parse(JSON.stringify(agents)));
    if (systemAgent) {
      setUpdatedSystemAgent(JSON.parse(JSON.stringify(systemAgent)));
    }
  }, [agents, systemAgent]);

  const handleVoiceChange = (agentName: string, voiceConfig: VoiceConfig) => {
    if (agentName === 'SYSTEM' && updatedSystemAgent) {
      setUpdatedSystemAgent({ ...updatedSystemAgent, voice: voiceConfig });
    } else {
      setUpdatedAgents(prev => prev.map(a => a.name === agentName ? { ...a, voice: voiceConfig } : a));
    }
  };
  
  const handleSave = () => {
    setSaveStatus('saving');
    if (updatedSystemAgent) {
      onSave(updatedAgents, updatedSystemAgent);
    }
    setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white font-orbitron">Voice Customization</h2>
        <div className="flex items-center gap-4">
           {saveStatus === 'saved' && <span className="text-lime-400 text-sm transition-opacity">Settings saved!</span>}
            <button 
              onClick={handleSave}
              className="bg-fuchsia-500 hover:bg-fuchsia-400 text-black font-extrabold py-2 px-4 rounded-lg transition-all duration-300 disabled:bg-gray-800 hover:shadow-[0_0_18px_rgba(217,70,239,0.5)]"
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save All Voice Settings'}
            </button>
        </div>
      </div>
      
      {updatedSystemAgent && (
          <div className="p-4 border border-fuchsia-500/30 rounded-lg glass">
              <h3 className="text-xl font-bold text-white mb-4">System Announcer Voice</h3>
              <VoiceEditor
                  key={updatedSystemAgent.name}
                  agent={updatedSystemAgent}
                  onChange={(vc) => handleVoiceChange(updatedSystemAgent.name, vc)}
              />
          </div>
      )}

      <div className="pt-6 border-t border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Agent Voices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {updatedAgents.map(agent => (
            <VoiceEditor 
              key={agent.name} 
              agent={agent} 
              onChange={(vc) => handleVoiceChange(agent.name, vc)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;