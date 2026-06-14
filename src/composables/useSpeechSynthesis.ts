import { ref, watch, onUnmounted, type Ref } from 'vue';

export interface SpeechSynthesisOptions {
  lang?: string;
  voice?: SpeechSynthesisVoice | null;
  pitch?: number;
  rate?: number;
  volume?: number;
}

export interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isPlaying: Ref<boolean>;
  speak: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  toggle: () => void;
  text: Ref<string>;
  setText: (newText: string) => void;
  lang: Ref<string>;
  setLang: (newLang: string) => void;
  pitch: Ref<number>;
  setPitch: (newPitch: number) => void;
  rate: Ref<number>;
  setRate: (newRate: number) => void;
  volume: Ref<number>;
  setVolume: (newVolume: number) => void;
  voices: Ref<SpeechSynthesisVoice[]>;
}

export function useSpeechSynthesis(initialText: string, options: SpeechSynthesisOptions = {}): UseSpeechSynthesisReturn {
  const isSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  const isPlaying = ref(false);
  const text = ref(initialText);
  const lang = ref(options.lang || 'en-US');
  const pitch = ref(options.pitch || 1);
  const rate = ref(options.rate || 1);
  const volume = ref(options.volume || 1);
  const voices = ref<SpeechSynthesisVoice[]>([]);

  let currentUtterance: SpeechSynthesisUtterance | null = null;
  let restartTimeout: ReturnType<typeof setTimeout> | null = null;

  const loadVoices = () => {
    if (!isSupported) return;
    voices.value = window.speechSynthesis.getVoices();
  };

  if (isSupported) {
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
  }

  onUnmounted(() => {
    if (isSupported) {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    }
    if (restartTimeout) clearTimeout(restartTimeout);
  });

  const updateUtterance = () => {
    if (!isSupported) return;

    currentUtterance = new SpeechSynthesisUtterance(text.value);

    currentUtterance.lang = lang.value;
    currentUtterance.pitch = pitch.value;
    currentUtterance.rate = rate.value;
    currentUtterance.volume = volume.value;

    if (options.voice) {
      currentUtterance.voice = options.voice;
    }

    currentUtterance.onstart = () => {
      isPlaying.value = true;
    };

    currentUtterance.onend = () => {
      isPlaying.value = false;
    };

    currentUtterance.onerror = (event) => {
      console.error('SpeechSynthesis error:', event);
      isPlaying.value = false;
    };
  };

  const speak = () => {
    if (!isSupported) {
      console.warn('SpeechSynthesis not supported in this browser');
      return;
    }

    updateUtterance();
    if (currentUtterance) {
      window.speechSynthesis.speak(currentUtterance);
    }
  };

  const pause = () => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    isPlaying.value = false;
  };

  const resume = () => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    isPlaying.value = true;
  };

  const stop = () => {
    if (!isSupported) return;
    if (restartTimeout) {
      clearTimeout(restartTimeout);
      restartTimeout = null;
    }
    window.speechSynthesis.cancel();
    isPlaying.value = false;
  };

  const toggle = () => {
    if (isPlaying.value) {
      pause();
    } else {
      speak();
    }
  };

  watch([text, lang, pitch, rate, volume], () => {
    if (isPlaying.value) {
      stop();
      if (restartTimeout) clearTimeout(restartTimeout);
      restartTimeout = setTimeout(() => {
        speak();
        restartTimeout = null;
      }, 150);
    }
  });

  return {
    isSupported,
    isPlaying,
    speak,
    pause,
    resume,
    stop,
    toggle,
    text,
    setText: (newText: string) => { text.value = newText; },
    lang,
    setLang: (newLang: string) => { lang.value = newLang; },
    pitch,
    setPitch: (newPitch: number) => { pitch.value = newPitch; },
    rate,
    setRate: (newRate: number) => { rate.value = newRate; },
    volume,
    setVolume: (newVolume: number) => { volume.value = newVolume; },
    voices,
  };
}