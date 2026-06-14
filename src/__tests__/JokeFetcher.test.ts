import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import JokeFetcher from '../../src/components/Joke/JokeFetcher.vue';

const mockFetch = vi.fn();
(global as any).fetch = mockFetch;

vi.mock('../../src/store', () => ({
  useGlobalToast: vi.fn(() => ({
    refToast: ref({ show: false, message: '', duration: 3000 })
  }))
}));

describe('JokeFetcher.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    
    expect(wrapper.exists()).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/jokes', expect.any(Object));
  });

  it('exposes joke data through currentJoke computed', async () => {
    const wrapper = mount(JokeFetcher, {
      props: {
        url: 'https://example.com/jokes'
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 10));
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

  it('exposes isFetching, statusCode, and error', () => {
    const wrapper = mount(JokeFetcher, {
      props: {
        url: 'https://example.com/jokes'
      }
    });
    
    expect(wrapper.vm.isFetching).toBeDefined();
    expect(wrapper.vm.statusCode).toBeDefined();
    expect(wrapper.vm.error).toBeDefined();
  });

  it('sets error on failed fetch', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve([])
    });

    const wrapper = mount(JokeFetcher, {
      props: { url: 'https://example.com/jokes' }
    });

    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.error).toBeTruthy();
    expect(wrapper.vm.error!.message).toContain('500');
  });

  it('returns null for currentJoke when data is empty', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([])
    });

    const wrapper = mount(JokeFetcher, {
      props: { url: 'https://example.com/jokes' }
    });

    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.currentJoke).toBeNull();
  });

  it('returns null for currentJoke when setup is missing', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([{ type: 'general', setup: '', punchline: 'test', id: 1 }])
    });

    const wrapper = mount(JokeFetcher, {
      props: { url: 'https://example.com/jokes' }
    });

    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 10));
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.currentJoke).toBeNull();
  });

  it('aborts previous fetch on new request', async () => {
    const wrapper = mount(JokeFetcher, {
      props: { url: 'https://example.com/jokes' }
    });

    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    const fetchPromise = wrapper.vm.executeWithRetry(3);

    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(mockFetch).toHaveBeenCalled();

    await fetchPromise;
  });
});