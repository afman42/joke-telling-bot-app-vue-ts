// vitest.setup.ts
import { vi } from 'vitest';

// Mock the window.speechSynthesis API globally
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
};

// Mock SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  text: string;
  lang: string;
  voice: any;
  pitch: number;
  rate: number;

  constructor(text: string) {
    this.text = text;
    this.lang = '';
    this.voice = null;
    this.pitch = 1;
    this.rate = 1;
  }
}

// Extend the global window object with the mocks
Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis,
});

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  value: MockSpeechSynthesisUtterance,
});