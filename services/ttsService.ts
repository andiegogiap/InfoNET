
import { VoiceConfig, ApiKeys, GoogleVoiceConfig, ElevenLabsVoiceConfig, HumeVoiceConfig, OpenAIVoiceConfig } from '../types';

let currentAudio: HTMLAudioElement | null = null;

const stopCurrentAudio = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};

const playAudioFromBase64 = async (base64: string) => {
  stopCurrentAudio();
  const audio = new Audio(`data:audio/mp3;base64,${base64}`);
  currentAudio = audio;
  await audio.play();
};

const playAudioFromUrl = async (url: string) => {
    stopCurrentAudio();
    const audio = new Audio(url);
    currentAudio = audio;
    await audio.play();
};

const speakOpenAI = async (text: string, settings: OpenAIVoiceConfig, apiKey: string) => {
  const ttsUrl = 'https://api.openai.com/v1/audio/speech';
  const body = {
    model: settings.model,
    input: text,
    voice: settings.voice,
  };

  const response = await fetch(ttsUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: { message: response.statusText }}));
    console.error('OpenAI API Error:', errorData);
    alert(`OpenAI TTS Error: ${errorData.error?.message || 'Unknown error'}`);
    throw new Error(`OpenAI API request failed with status ${response.status}`);
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  await playAudioFromUrl(audioUrl);
};

const speakGoogle = async (text: string, settings: GoogleVoiceConfig, apiKey: string) => {
  const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
  const body = {
    input: { text },
    voice: {
      languageCode: settings.languageCode,
      name: settings.name,
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: settings.speakingRate,
      pitch: settings.pitch,
    },
  };

  const response = await fetch(ttsUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMessage = `Google TTS API request failed with status ${response.status}`;
    let detailedError = '';
    try {
      const errorData = await response.json();
      console.error('Google TTS API Error:', errorData);
      detailedError = errorData?.error?.message || JSON.stringify(errorData);
      errorMessage = `Google Text-to-Speech Error: ${detailedError}`;
    } catch (e) {
      console.error('Failed to parse error JSON from Google TTS API', e);
      errorMessage = `Google TTS API request failed with status ${response.status} and could not parse error response. Check browser console for details.`;
    }
    
    if (response.status === 403) {
        errorMessage += '\n\nThis is a permission error (403). Please check that:\n1. Your Google Cloud API key is correct.\n2. The "Cloud Text-to-Speech API" is enabled in your project.\n3. Your API key has the correct restrictions (e.g., HTTP referrer).';
    }

    alert(errorMessage);
    throw new Error(`Google TTS API request failed: ${detailedError || response.statusText}`);
  }

  const data = await response.json();
  await playAudioFromBase64(data.audioContent);
};

const speakElevenLabs = async (text: string, settings: ElevenLabsVoiceConfig, apiKey: string) => {
  const { voiceId, model_id, stability, similarity_boost } = settings;
  const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  
  const body: { text: string, model_id?: string, voice_settings?: any } = { text };
  if (model_id) body.model_id = model_id;
  if (stability !== undefined || similarity_boost !== undefined) {
    body.voice_settings = {
        stability,
        similarity_boost,
        style: 0.5, // Default style
        use_speaker_boost: true,
    };
  }

  const response = await fetch(ttsUrl, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('ElevenLabs API Error:', errorData);
    alert(`ElevenLabs TTS Error: ${errorData.detail?.message || 'Unknown error'}`);
    throw new Error(`ElevenLabs API request failed with status ${response.status}`);
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  await playAudioFromUrl(audioUrl);
};

const speakHume = async (text: string, settings: HumeVoiceConfig, apiKey: string) => {
  alert("Hume AI Text-to-Speech is not yet implemented in this version.");
  // Placeholder for future implementation
  console.log("Hume AI TTS call:", { text, settings, apiKey });
};


export const speak = async (
  text: string, 
  voiceConfig: VoiceConfig, 
  apiKeys: ApiKeys
): Promise<void> => {
  stopCurrentAudio();

  try {
    switch(voiceConfig.provider) {
      case 'openai':
        if (!apiKeys.openai) {
          alert('OpenAI API Key for Text-to-Speech is not set. Please configure it in the API Keys tab.');
          throw new Error('TTS API key not provided for OpenAI.');
        }
        await speakOpenAI(text, voiceConfig.settings, apiKeys.openai);
        break;
      
      case 'google':
        if (!apiKeys.googleCloud) {
          alert('Google Cloud API Key for Text-to-Speech is not set. Please configure it in the API Keys tab.');
          throw new Error('TTS API key not provided for Google.');
        }
        await speakGoogle(text, voiceConfig.settings, apiKeys.googleCloud);
        break;
      
      case 'elevenlabs':
        if (!apiKeys.elevenlabs) {
          alert('ElevenLabs API Key for Text-to-Speech is not set. Please configure it in the API Keys tab.');
          throw new Error('TTS API key not provided for ElevenLabs.');
        }
        await speakElevenLabs(text, voiceConfig.settings, apiKeys.elevenlabs);
        break;

      case 'hume':
        if (!apiKeys.hume) {
          alert('Hume AI API Key for Text-to-Speech is not set. Please configure it in the API Keys tab.');
          throw new Error('TTS API key not provided for Hume AI.');
        }
        await speakHume(text, voiceConfig.settings, apiKeys.hume);
        break;

      default:
        const unhandledProvider = (voiceConfig as any).provider;
        console.error('Unknown TTS provider:', unhandledProvider);
        alert(`Unknown TTS provider configured: ${unhandledProvider}`);
        throw new Error('Unknown TTS provider');
    }
  } catch (error) {
    console.error('Failed to synthesize speech:', error);
    // Error is alerted within the provider function, re-throwing is optional
    throw error;
  }
};
