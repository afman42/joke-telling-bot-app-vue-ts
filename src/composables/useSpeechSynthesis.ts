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

/**
 * Custom composable to handle text-to-speech functionality using the Web Speech API
 * This provides a Vue-friendly wrapper around the browser's SpeechSynthesis API
 * 
 * Features:
 * - Text-to-speech conversion
 * - Adjustable pitch, rate, and volume
 * - Support for different voices
 * - Play/pause/stop controls
 * - Browser compatibility checking
 */
export function useSpeechSynthesis(initialText: string, options: SpeechSynthesisOptions = {}): UseSpeechSynthesisReturn {
  // Check if the browser supports the Web Speech API
  // Both speechSynthesis API and SpeechSynthesisUtterance constructor must be available
  const isSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  
  // Reactive state to track if speech is currently playing
  const isPlaying = ref(false);
  
  // Reactive properties for speech parameters
  const text = ref(initialText);
  const lang = ref(options.lang || 'en-US');
  const pitch = ref(options.pitch || 1);  // Normal pitch is 1, range is typically 0-2
  const rate = ref(options.rate || 1);    // Normal rate is 1, range is typically 0.1-10
  const volume = ref(options.volume || 1); // Normal volume is 1, range is 0-1

  // Store the current utterance (the object that represents the speech)
  let currentUtterance: SpeechSynthesisUtterance | null = null;
  
  /**
   * Creates or updates the speech utterance with current parameters
   */
  const updateUtterance = () => {
    if (!isSupported) return;
    
    // Create a new utterance with the current text
    currentUtterance = new SpeechSynthesisUtterance(text.value);
    
    // Apply speech parameters
    currentUtterance.lang = lang.value;
    currentUtterance.pitch = pitch.value;
    currentUtterance.rate = rate.value;
    currentUtterance.volume = volume.value;
    
    // Apply voice if specified
    if (options.voice) {
      currentUtterance.voice = options.voice;
    }
    
    // Set up event handlers
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

  /**
   * Starts speaking the current text
   */
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

  /**
   * Pauses the current speech
   */
  const pause = () => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
  };

  /**
   * Resumes paused speech
   */
  const resume = () => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
  };

  /**
   * Stops the current speech immediately
   */
  const stop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel(); // 'cancel' stops immediately, 'pause' pauses
    isPlaying.value = false;
  };

  /**
   * Toggles between speaking and pausing
   */
  const toggle = () => {
    if (isPlaying.value) {
      pause();
    } else {
      speak();
    }
  };

  // Watch for changes to reactive values and update speech if playing
  watch([text, lang, pitch, rate, volume], () => {
    if (isPlaying.value) {
      // If currently playing, restart with new settings
      const wasPlaying = isPlaying.value;
      stop();
      if (wasPlaying) {
        // Restart after a short delay to apply new settings
        setTimeout(() => speak(), 100);
      }
    }
  });

  // Return the API for the composable
  return {
    isSupported,                    // Whether the API is supported in the current browser
    isPlaying: isPlaying.value,    // Whether speech is currently playing (value, not ref)
    speak,                          // Start speaking the current text
    pause,                          // Pause the current speech
    resume,                         // Resume paused speech
    stop,                           // Stop the current speech
    toggle,                         // Toggle between play/pause
    text: text.value,              // Current text to speak (value)
    setText: (newText: string) => { text.value = newText; }, // Update the text to speak
    lang: lang.value,              // Current language (value)
    setLang: (newLang: string) => { lang.value = newLang; }, // Update the language
    pitch: pitch.value,            // Current pitch (value)
    setPitch: (newPitch: number) => { pitch.value = newPitch; }, // Update the pitch
    rate: rate.value,              // Current rate (value)
    setRate: (newRate: number) => { rate.value = newRate; }, // Update the rate
    volume: volume.value,          // Current volume (value)
    setVolume: (newVolume: number) => { volume.value = newVolume; }, // Update the volume
  };
}