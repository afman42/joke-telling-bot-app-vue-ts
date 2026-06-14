import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, shallowRef } from 'vue';
import Toast from '../../src/components/Toast.vue';

vi.useFakeTimers();

const toastState = shallowRef({ show: false, message: '', duration: 3000 });

vi.mock('../../src/store', () => ({
  useGlobalToast: () => ({ refToast: toastState })
}));

describe('Toast.vue', () => {
  beforeEach(() => {
    toastState.value = { show: false, message: '', duration: 3000 };
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders the toast component', () => {
    const wrapper = mount(Toast);
    expect(wrapper.exists()).toBe(true);
    expect(document.querySelector('.snackbar')).toBeTruthy();
  });

  it('shows the snackbar when show is true', async () => {
    mount(Toast);
    
    toastState.value = { show: true, message: 'Test toast', duration: 3000 };
    await nextTick();
    
    const snackbar = document.querySelector('.snackbar');
    expect(snackbar).toBeTruthy();
    expect(snackbar!.classList.contains('show')).toBe(true);
    expect(snackbar!.textContent).toBe('Test toast');
  });

  it('auto-hides the snackbar after duration', async () => {
    mount(Toast);
    
    toastState.value = { show: true, message: 'Auto-hide toast', duration: 1000 };
    await nextTick();
    
    expect(document.querySelector('.snackbar.show')).toBeTruthy();
    
    vi.advanceTimersByTime(1000);
    await nextTick();
    
    expect(toastState.value.show).toBe(false);
    expect(toastState.value.message).toBe('');
  });

  it('clears previous timeout when new toast is shown', async () => {
    mount(Toast);
    
    toastState.value = { show: true, message: 'First toast', duration: 10000 };
    await nextTick();
    
    vi.advanceTimersByTime(100);
    
    toastState.value = { show: true, message: 'Second toast', duration: 5000 };
    await nextTick();
    
    vi.advanceTimersByTime(5000);
    await nextTick();
    
    expect(toastState.value.show).toBe(false);
    expect(toastState.value.message).toBe('');
  });
});