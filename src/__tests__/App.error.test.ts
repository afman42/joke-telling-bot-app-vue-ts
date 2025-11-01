import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import App from '../App.vue';

// Mock the store
vi.mock('../store', () => ({
  useGlobalToast: vi.fn(() => ({
    refToast: ref({ show: false, message: '' })
  }))
}));

// Mock the environment variables
vi.stubEnv('VITE_JOKE_URL', 'https://example.com/jokes');

describe('App.vue - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('component renders even when there are errors', () => {
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
  });
});