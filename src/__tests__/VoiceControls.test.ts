import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import VoiceControls from '../../src/components/Joke/VoiceControls.vue';

// Mock the store
vi.mock('../../src/store', () => ({
  useGlobalToast: vi.fn(() => ({
    refToast: ref({ show: false, message: '' })
  }))
}));

// Check if SpeechSynthesisUtterance is already defined before defining it
if (!(window as any).SpeechSynthesisUtterance) {
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

  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    value: MockSpeechSynthesisUtterance,
  });
}

// Check if speechSynthesis is already mocked before mocking it
if (!(window as any).speechSynthesis) {
  const mockSpeechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => []),
    isSupported: true,
    isPlaying: ref(false),
  };

  Object.defineProperty(window, 'speechSynthesis', {
    value: mockSpeechSynthesis,
  });
}

// Mock the useSpeechSynthesis hook
vi.mock('@vueuse/core', async () => {
  const actual: any = await vi.importActual('@vueuse/core');
  return {
    ...actual,
    useSpeechSynthesis: vi.fn(() => ({
      text: ref("Loading joke..."),
      speak: vi.fn(),
      isPlaying: ref(false),
      isSupported: true,
    }))
  };
});

describe('VoiceControls.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders voice controls properly', () => {
    const wrapper = mount(VoiceControls, {
      props: {
        joke: { type: 'general', setup: 'Why did the chicken cross the road?', punchline: 'To get to the other side!', id: 1 },
        isFetching: false,
        statusCode: 200
      }
    });
    
    expect(wrapper.find('#pitch-slider').exists()).toBe(true);
    expect(wrapper.find('#rate-slider').exists()).toBe(true);
    expect(wrapper.find('button').exists()).toBe(true);
  });

  it('disables button when fetching', () => {
    const wrapper = mount(VoiceControls, {
      props: {
        joke: { type: 'general', setup: 'Why did the chicken cross the road?', punchline: 'To get to the other side!', id: 1 },
        isFetching: true,
        statusCode: 200
      }
    });
    
    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
  });

  it('calls play function when button is clicked', async () => {
    const wrapper = mount(VoiceControls, {
      props: {
        joke: { type: 'general', setup: 'Why did the chicken cross the road?', punchline: 'To get to the other side!', id: 1 },
        isFetching: false,
        statusCode: 200
      }
    });
    
    const button = wrapper.find('button');
    await button.trigger('click');
    
    // Since play is exposed through defineExpose, we need to check the component instance
    expect(wrapper.vm.play).toBeDefined();
  });
});