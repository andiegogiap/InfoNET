
export type TTSProvider = 'google' | 'elevenlabs' | 'hume' | 'openai';

export interface GoogleVoiceConfig {
  languageCode: string;
  name: string;
  pitch: number;
  speakingRate: number;
}

export interface ElevenLabsVoiceConfig {
  voiceId: string;
  model_id?: string;
  stability?: number;
  similarity_boost?: number;
}

export interface HumeVoiceConfig {
  // Hume's API is often stream-based. This is a placeholder for potential non-streaming synthesis.
  voiceId: string; 
}

export interface OpenAIVoiceConfig {
    model: 'tts-1' | 'tts-1-hd';
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
}

export type VoiceConfig = 
  | { provider: 'google', settings: GoogleVoiceConfig }
  | { provider: 'elevenlabs', settings: ElevenLabsVoiceConfig }
  | { provider: 'hume', settings: HumeVoiceConfig }
  | { provider: 'openai', settings: OpenAIVoiceConfig };

export interface Agent {
  name: string;
  gender: 'Male' | 'Female';
  role:string;
  voice_style: string;
  personality: string;
  domain: string;
  tags: string[];
  voice: VoiceConfig;
}

export interface WorkflowStep {
  id: number;
  name: string;
  agent: string;
  verb: string;
  input: string;
  output: string;
  handover_to?: string;
}

export interface Message {
  id?: string;
  agentName: string;
  text: string;
  step?: WorkflowStep;
}

export type AppTab = 'orchestration' | 'conversation' | 'workflow' | 'settings' | 'api-keys';

export interface ApiKeys {
  gemini: string;
  googleCloud: string;
  openai: string;
  v0dev: string;
  abacus: string;
  elevenlabs: string;
  hume: string;
}

export interface Workflow {
  meta: {
    flow_name: string;
    flow_id: number;
    owner: string;
    description: string;
  };
  agents: { [key: string]: { role: string; verbs: string[] } };
  schedule: {
    trigger: string;
    fallback_cron: string;
  };
  steps: WorkflowStep[];
}

export interface CustomInstructions {
  aiSupervisor: string;
  systemOrchestrator: string;
}