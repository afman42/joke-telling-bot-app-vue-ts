import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import App from '../App.vue';

vi.mock('../store', () => ({
  useGlobalToast: vi.fn(() => ({
    refToast: ref({ show: false, message: '', duration: 3000 })
  }))
}));

vi.stubEnv('VITE_JOKE_URL', 'https://example.com/jokes');

describe('App.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mounts properly with a valid API URL', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          'JokeFetcher': true,
          'VoiceControls': true,
          'KeyboardHandler': true,
          'Toast': true
        }
      }
    });
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.attributes('role')).toBe('main');
  });

  it('shows warning when no API URL is configured', () => {
    vi.stubEnv('VITE_JOKE_URL', '');

    const wrapper = mount(App, {
      global: {
        stubs: {
          'JokeFetcher': true,
          'VoiceControls': true,
          'KeyboardHandler': true,
          'Toast': true
        }
      }
    });

    expect(wrapper.text()).toContain('VITE_JOKE_URL');
  });

  it('renders without errors with partial stubs', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          'JokeFetcher': true,
          'VoiceControls': true,
          'Toast': true
        }
      }
    });

    expect(wrapper.exists()).toBe(true);
  });
});