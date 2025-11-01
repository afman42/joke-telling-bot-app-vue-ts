import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import JokeFetcher from '../../src/components/Joke/JokeFetcher.vue';

// Mock the global fetch API
const mockFetch = vi.fn();
(global as any).fetch = mockFetch;

// Mock the store
vi.mock('../../src/store', () => ({
  useGlobalToast: vi.fn(() => ({
    refToast: ref({ show: false, message: '' })
  }))
}));

describe('JokeFetcher.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock response
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([{ type: 'general', setup: 'Why did the chicken cross the road?', punchline: 'To get to the other side!', id: 1 }])
    });
  });

  it('fetches jokes from the provided URL', async () => {
    const wrapper = mount(JokeFetcher, {
      props: {
        url: 'https://example.com/jokes'
      }
    });
    
    // Wait for the onMounted to complete the initial fetch
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    
    expect(wrapper.exists()).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/jokes');
  });

  it('exposes joke data through currentJoke computed', async () => {
    const wrapper = mount(JokeFetcher, {
      props: {
        url: 'https://example.com/jokes'
      }
    });
    
    // Wait for the async fetch to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    // Wait a bit more for the reactive updates to propagate
    await new Promise(resolve => setTimeout(resolve, 10));
    await wrapper.vm.$nextTick();
    
    // Access the exposed value
    const componentInstance = wrapper.vm;
    // Since the data loading is async, we need to wait and re-evaluate
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