import { ref, watch } from 'vue';

export interface SpeechSynthesisOptions {
  lang?: string;
  voice?: SpeechSynthesisVoice | null;
  pitch?: number;
  rate?: number;
  volume?: number;
}

export interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isPlaying: boolean;
  speak: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  toggle: () => void;
  text: string;
  setText: (newText: string) => void;
  lang: string;
  setLang: (newLang: string) => void;
  pitch: number;
  setPitch: (newPitch: number) => void;
  rate: number;
  setRate: (newRate: number) => void;
  volume: number;
  setVolume: (newVolume: number) => void;
}

export function useSpeechSynthesis(initialText: string, options: SpeechSynthesisOptions = {}): UseSpeechSynthesisReturn {
  // Check for both speechSynthesis API and the SpeechSynthesisUtterance constructor
  const isSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const isPlaying = ref(false);
  const text = ref(initialText);
  const lang = ref(options.lang || 'en-US');
  const pitch = ref(options.pitch || 1);
  const rate = ref(options.rate || 1);
  const volume = ref(options.volume || 1);
  
  let utterance: SpeechSynthesisUtterance | null = null;
  
  const updateUtterance = () => {
    if (!isSupported) return;
    
    // Always create a new utterance to avoid state issues
    utterance = new SpeechSynthesisUtterance(text.value);
    utterance.lang = lang.value;
    utterance.pitch = pitch.value;
    utterance.rate = rate.value;
    utterance.volume = volume.value;
    if (options.voice) {
      utterance.voice = options.voice;
    }
    
    utterance.onstart = () => {
      isPlaying.value = true;
    };
    
    utterance.onend = () => {
      isPlaying.value = false;
    };
    
    utterance.onerror = () => {
      isPlaying.value = false;
    };
  };

  const speak = () => {
    if (!isSupported) return;
    
    updateUtterance();
    if (utterance && 'speechSynthesis' in window) {
      (window as any).speechSynthesis.speak(utterance);
    }
  };

  const pause = () => {
    if (!isSupported) return;
    if ('speechSynthesis' in window) {
      (window as any).speechSynthesis.pause();
    }
  };

  const resume = () => {
    if (!isSupported) return;
    if ('speechSynthesis' in window) {
      (window as any).speechSynthesis.resume();
    }
  };

  const stop = () => {
    if (!isSupported) return;
    if ('speechSynthesis' in window) {
      (window as any).speechSynthesis.cancel();
    }
    isPlaying.value = false;
  };

  const toggle = () => {
    if (isPlaying.value) {
      pause();
    } else {
      speak();
    }
  };

  // Watch for changes to reactive values and update utterance when needed
  watch([text, lang, pitch, rate, volume], () => {
    if (isPlaying.value) {
      // If currently playing, restart with new settings
      const wasPlaying = isPlaying.value;
      stop();
      if (wasPlaying) {
        setTimeout(() => speak(), 100); // Restart after a short delay
      }
    }
  });

  return {
    isSupported,
    isPlaying: isPlaying.value,
    speak,
    pause,
    resume,
    stop,
    toggle,
    text: text.value,
    setText: (newText: string) => { text.value = newText; },
    lang: lang.value,
    setLang: (newLang: string) => { lang.value = newLang; },
    pitch: pitch.value,
    setPitch: (newPitch: number) => { pitch.value = newPitch; },
    rate: rate.value,
    setRate: (newRate: number) => { rate.value = newRate; },
    volume: volume.value,
    setVolume: (newVolume: number) => { volume.value = newVolume; },
  };
}