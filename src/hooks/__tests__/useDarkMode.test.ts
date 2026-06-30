import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDarkMode } from '../useDarkMode';

describe('useDarkMode', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('should initialize with light mode by default if no local storage or media preference', () => {
    const { result } = renderHook(() => useDarkMode());
    
    expect(result.current.isDarkMode).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should initialize with dark mode if local storage has "dark"', () => {
    localStorage.setItem('theme', 'dark');
    
    const { result } = renderHook(() => useDarkMode());
    
    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should toggle dark mode on and off', () => {
    const { result } = renderHook(() => useDarkMode());
    
    expect(result.current.isDarkMode).toBe(false);
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(result.current.isDarkMode).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
