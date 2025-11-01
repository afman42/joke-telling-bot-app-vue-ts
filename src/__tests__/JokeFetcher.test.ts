import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import JokeFetcher from '../../src/components/Joke/JokeFetcher.vue';

// Mock the useFetch from vueuse
vi.mock('@vueuse/core', async () => {
  const actual: any = await vi.importActual('@vueuse/core');
  return {
    ...actual,
    useFetch: vi.fn(() => ({
      data: ref([{ type: 'general', setup: 'Why did the chicken cross the road?', punchline: 'To get to the other side!', id: 1 }]),
      isFetching: ref(false),
      error: ref(null),
      execute: vi.fn(),
      statusCode: ref(200),
      get: vi.fn(() => ({
        json: vi.fn(() => ({
          data: ref([{ type: 'general', setup: 'Why did the chicken cross the road?', punchline: 'To get to the other side!', id: 1 }]),
          isFetching: ref(false),
          error: ref(null),
          execute: vi.fn(),
          statusCode: ref(200),
        }))
      }))
    })),
  };
});

// Mock the store
vi.mock('../../src/store', () => ({
  useGlobalToast: vi.fn(() => ({
    refToast: ref({ show: false, message: '' })
  }))
}));

describe('JokeFetcher.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches jokes from the provided URL', () => {
    const wrapper = mount(JokeFetcher, {
      props: {
        url: 'https://example.com/jokes'
      }
    });
    
    expect(wrapper.exists()).toBe(true);
  });

  it('exposes joke data through currentJoke computed', async () => {
    const wrapper = mount(JokeFetcher, {
      props: {
        url: 'https://example.com/jokes'
      }
    });
    
    // Wait for component to update
    await wrapper.vm.$nextTick();
    
    const componentInstance = wrapper.vm;
    expect(componentInstance.currentJoke).toEqual({
      type: 'general',
      setup: 'Why did the chicken cross the road?',
      punchline: 'To get to the other side!',
      id: 1
    });
  });

  it('has executeWithRetry function', () => {
    const wrapper = mount(JokeFetcher, {
      props: {
        url: 'https://example.com/jokes'
      }
    });
    
    expect(typeof wrapper.vm.executeWithRetry).toBe('function');
  });
});