import { describe, it, expect } from 'vitest';
import { useGlobalToast } from '../store';

describe('store.ts', () => {
  it('should create a global toast state', () => {
    const { refToast } = useGlobalToast();
    
    expect(refToast.value).toEqual({
      message: '',
      show: false,
    });
  });

  it('should update the toast state', () => {
    const { refToast } = useGlobalToast();
    
    refToast.value = {
      show: true,
      message: 'Test message'
    };
    
    expect(refToast.value).toEqual({
      show: true,
      message: 'Test message'
    });
  });
});