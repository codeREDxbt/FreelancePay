import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock dependencies
vi.mock('@/lib/firebase/config', () => ({
  auth: {}
}));

vi.mock('firebase/auth', () => ({
  signInWithCustomToken: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

describe('useWallet', () => {
  beforeEach(() => {
    localStorage.clear();
    // Clear the global kit if it exists
    delete (window as any).__STELLAR_KIT__;
    delete (window as any).__STELLAR_NETWORKS__;
    
    // Reset modules to clear module-level cache of hasReadWalletAddress
    vi.resetModules();
  });

  it('should initialize with disconnected state if no address in localStorage', async () => {
    const { useWallet } = await import('../useWallet');
    const { result } = renderHook(() => useWallet());
    
    expect(result.current.isConnected).toBe(false);
    expect(result.current.publicKey).toBeNull();
  });

  it('should initialize with connected state if address exists in localStorage', async () => {
    localStorage.setItem('fp_wallet_address', 'GA1234567890');
    
    const { useWallet } = await import('../useWallet');
    const { result } = renderHook(() => useWallet());
    
    expect(result.current.isConnected).toBe(true);
    expect(result.current.publicKey).toBe('GA1234567890');
  });

  it('should open and close modal correctly', async () => {
    const { useWallet } = await import('../useWallet');
    const { result } = renderHook(() => useWallet());
    
    expect(result.current.isModalOpen).toBe(false);
    
    act(() => {
      result.current.openModal();
    });
    
    expect(result.current.isModalOpen).toBe(true);
    
    act(() => {
      result.current.closeModal();
    });
    
    expect(result.current.isModalOpen).toBe(false);
  });
  
  it('should disconnect wallet correctly', async () => {
    localStorage.setItem('fp_wallet_address', 'GA1234567890');
    const { useWallet } = await import('../useWallet');
    const { result } = renderHook(() => useWallet());
    
    expect(result.current.isConnected).toBe(true);
    
    await act(async () => {
      await result.current.disconnectWallet();
    });
    
    expect(result.current.isConnected).toBe(false);
    expect(result.current.publicKey).toBeNull();
    expect(localStorage.getItem('fp_wallet_address')).toBeNull();
  });
});
