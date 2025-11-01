import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import KeyboardHandler from '../../src/components/Joke/KeyboardHandler.vue';

describe('KeyboardHandler.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds and removes keyup event listener', () => {
    // Mock addEventListener and removeEventListener
    const addEventListenerSpy = vi.spyOn(document.body, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(document.body, 'removeEventListener');
    
    const wrapper = mount(KeyboardHandler);
    
    // Check if addEventListener was called
    expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    
    // Reset mocks to check for removal
    addEventListenerSpy.mockClear();
    removeEventListenerSpy.mockClear();
    
    wrapper.unmount();
    
    // Check if removeEventListener was called
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
  });

  it('emits jKey event when J key is pressed', async () => {
    const wrapper = mount(KeyboardHandler);
    
    const mockCallback = vi.fn();
    wrapper.vm.$emit = mockCallback;
    
    // Simulate 'J' key press
    const keyEvent = new KeyboardEvent('keyup', { key: 'J' });
    document.body.dispatchEvent(keyEvent);
    
    // It should emit jKey event
    expect(wrapper.emitted('jKey')).toBeTruthy();
  });

  it('emits jKey event when j key is pressed', () => {
    const wrapper = mount(KeyboardHandler);
    
    // Simulate 'j' key press
    const keyEvent = new KeyboardEvent('keyup', { key: 'j' });
    document.body.dispatchEvent(keyEvent);
    
    // It should emit jKey event
    expect(wrapper.emitted('jKey')).toBeTruthy();
  });

  it('does not emit jKey event for other keys', () => {
    const wrapper = mount(KeyboardHandler);
    
    // Simulate 'A' key press
    const keyEvent = new KeyboardEvent('keyup', { key: 'A' });
    document.body.dispatchEvent(keyEvent);
    
    // It should not emit jKey event
    expect(wrapper.emitted('jKey')).toBeUndefined();
  });
});