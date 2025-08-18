import React, { useState, useEffect } from 'react';
import { ApiKeys } from '../types';

interface ApiKeysPanelProps {
  apiKeys: ApiKeys;
  onSave: (keys: ApiKeys) => void | Promise<void>;
}

interface ApiKeyInputProps {
  label: string;
  name: keyof ApiKeys;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    <input
      type="password"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-neutral-900 border border-neutral-700 rounded-md py-2 px-3 text-white focus:ring-fuchsia-500 focus:border-fuchsia-500 transition"
      placeholder={placeholder}
      autoComplete="off"
    />
  </div>
);

const ApiKeysPanel: React.FC<ApiKeysPanelProps> = ({ apiKeys, onSave }) => {
  const [keys, setKeys] = useState<ApiKeys>(apiKeys);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setKeys(apiKeys);
  }, [apiKeys]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setSaveStatus('saving');
    onSave(keys);
    setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  return (
    <div className="glass p-6 rounded-lg shadow-xl animate-fade-in space-y-6">
      <h2 className="text-2xl font-bold text-white font-orbitron">API Key Management</h2>
      
      <div className="bg-purple-500/10 border-l-4 border-purple-400 text-purple-200 p-4 rounded-r-lg shadow-[inset_0_0_10px_rgba(192,132,252,0.3)]" role="alert">
        <p className="font-bold">Important Note on API Keys</p>
         <p className="text-sm mt-1">
          <strong>OpenAI (Audio Playback):</strong> This is the app's default Text-to-Speech provider. An API key is required here for audio playback.
        </p>
        <p className="text-sm mt-1">
          <strong>Google Gemini (Conversations):</strong> The conversation logic uses a Gemini key managed by the environment (`process.env.API_KEY`) and does not need to be configured here.
        </p>
        <p className="text-sm mt-1">
          <strong>Other TTS Providers:</strong> Keys for Google Cloud, ElevenLabs, or Hume AI can be configured below and selected in the Settings tab.
        </p>
      </div>
      
      <div className="space-y-4">
        <ApiKeyInput 
          label="OpenAI API Key (for Text-to-Speech)" 
          name="openai" 
          value={keys.openai} 
          onChange={handleInputChange}
          placeholder="Enter your OpenAI key"
        />
        <ApiKeyInput 
          label="ElevenLabs API Key (Alternative TTS)" 
          name="elevenlabs" 
          value={keys.elevenlabs} 
          onChange={handleInputChange} 
          placeholder="Enter your ElevenLabs key"
        />
        <ApiKeyInput 
          label="Google Cloud API Key (Alternative TTS)" 
          name="googleCloud" 
          value={keys.googleCloud} 
          onChange={handleInputChange} 
          placeholder="Enter your Google Cloud Platform key"
        />
         <ApiKeyInput 
          label="Hume AI API Key (Alternative TTS)" 
          name="hume" 
          value={keys.hume} 
          onChange={handleInputChange} 
          placeholder="Enter your Hume AI key"
        />
        <ApiKeyInput 
          label="v0.dev API Key" 
          name="v0dev" 
          value={keys.v0dev} 
          onChange={handleInputChange} 
          placeholder="Future use: Enter your v0.dev key"
        />
        <ApiKeyInput 
          label="Abacus AI API Key" 
          name="abacus" 
          value={keys.abacus} 
          onChange={handleInputChange} 
          placeholder="Future use: Enter your Abacus AI key"
        />
      </div>

      <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-800">
        {saveStatus === 'saved' && <span className="text-lime-400 text-sm transition-opacity">Keys saved!</span>}
        <button
          onClick={handleSave}
          className="bg-fuchsia-500 hover:bg-fuchsia-400 text-black font-extrabold py-2 px-4 rounded-lg transition-all duration-300 disabled:bg-gray-800 hover:shadow-[0_0_18px_rgba(217,70,239,0.5)]"
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save API Keys'}
        </button>
      </div>
    </div>
  );
};

export default ApiKeysPanel;
