import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import VoiceControls from '../../src/components/Joke/VoiceControls.vue';

vi.mock('../../src/store', () => ({
  useGlobalToast: vi.fn(() => ({
    refToast: ref({ show: false, message: '', duration: 3000 })
  }))
}));

if (!(window as any).SpeechSynthesisUtterance) {
  class MockSpeechSynthesisUtterance {
    text: string;
    lang: string;
    voice: any;
    pitch: number;
    rate: number;
    volume: number;

    constructor(text: string) {
      this.text = text;
      this.lang = '';
      this.voice = null;
      this.pitch = 1;
      this.rate = 1;
      this.volume = 1;
    }
  }

  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    value: MockSpeechSynthesisUtterance,
  });
}

if (!(window as any).speechSynthesis) {
  const mockSpeechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  Object.defineProperty(window, 'speechSynthesis', {
    value: mockSpeechSynthesis,
  });
}

vi.mock('../../src/composables/useSpeechSynthesis', () => ({
  useSpeechSynthesis: vi.fn(() => ({
    isSupported: true,
    isPlaying: ref(false),
    speak: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
    toggle: vi.fn(),
    text: ref("Loading joke..."),
    setText: vi.fn(),
    lang: ref("en-US"),
    setLang: vi.fn(),
    pitch: ref(1),
    setPitch: vi.fn(),
    rate: ref(1),
    setRate: vi.fn(),
    volume: ref(1),
    setVolume: vi.fn(),
    voices: ref([]),
  }))
}));

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

  it('displays joke setup and punchline', () => {
    const wrapper = mount(VoiceControls, {
      props: {
        joke: { type: 'general', setup: 'Why did the chicken cross the road?', punchline: 'To get to the other side!', id: 1 },
        isFetching: false,
        statusCode: 200
      }
    });
    
    expect(wrapper.find('.joke-card').exists()).toBe(true);
    expect(wrapper.find('.joke-setup').text()).toBe('Why did the chicken cross the road?');
    expect(wrapper.find('.joke-punchline').text()).toBe('To get to the other side!');
  });

  it('hides joke card when joke is null', () => {
    const wrapper = mount(VoiceControls, {
      props: {
        joke: null,
        isFetching: false,
        statusCode: 200
      }
    });
    
    expect(wrapper.find('.joke-card').exists()).toBe(false);
  });

  it('hides joke card when setup is empty', () => {
    const wrapper = mount(VoiceControls, {
      props: {
        joke: { type: 'general', setup: '', punchline: 'test', id: 1 },
        isFetching: false,
        statusCode: 200
      }
    });
    
    expect(wrapper.find('.joke-card').exists()).toBe(false);
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
    
    expect(wrapper.vm.play).toBeDefined();
  });
});