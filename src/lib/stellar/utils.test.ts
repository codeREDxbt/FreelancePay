import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/stellar/client', () => ({
  sorobanServer: {
    sendTransaction: vi.fn(),
    getTransaction: vi.fn(),
  },
}));

import { submitSignedTransaction } from '@/lib/stellar/utils';
import { sorobanServer } from '@/lib/stellar/client';

describe('submitSignedTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('submits, polls until SUCCESS, and returns the result', async () => {
    const sendMock = vi.mocked(sorobanServer.sendTransaction);
    const getMock = vi.mocked(sorobanServer.getTransaction);
    sendMock.mockResolvedValueOnce({ status: 'SUCCESS', hash: 'abc' } as never);
    getMock.mockResolvedValueOnce({ status: 'SUCCESS', hash: 'abc' } as never);

    const result = await submitSignedTransaction('xdr');
    expect(result.status).toBe('SUCCESS');
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledTimes(1);
  });

  it('polls again if NOT_FOUND then resolves on SUCCESS', async () => {
    const sendMock = vi.mocked(sorobanServer.sendTransaction);
    const getMock = vi.mocked(sorobanServer.getTransaction);
    let callCount = 0;
    sendMock.mockResolvedValue({ status: 'SUCCESS', hash: 'abc' } as never);
    getMock.mockImplementation((() => {
      callCount++;
      if (callCount === 1 || callCount === 2) return Promise.resolve({ status: 'NOT_FOUND', hash: 'abc' });
      return Promise.resolve({ status: 'SUCCESS', hash: 'abc' });
    }) as never);

    const result = await submitSignedTransaction('xdr');
    expect(result.status).toBe('SUCCESS');
    expect(getMock).toHaveBeenCalledTimes(3);
  });

  it('throws on ERROR status from sendTransaction', async () => {
    const sendMock = vi.mocked(sorobanServer.sendTransaction);
    sendMock.mockResolvedValue({ status: 'ERROR', errorResult: { x: 1 } } as never);

    await expect(submitSignedTransaction('xdr')).rejects.toThrow(/Transaction failed/);
  });

  it('throws on FAILED status from getTransaction', async () => {
    const sendMock = vi.mocked(sorobanServer.sendTransaction);
    const getMock = vi.mocked(sorobanServer.getTransaction);
    sendMock.mockResolvedValue({ status: 'SUCCESS', hash: 'abc' } as never);
    getMock.mockResolvedValue({ status: 'FAILED', hash: 'abc' } as never);

    await expect(submitSignedTransaction('xdr')).rejects.toThrow(/execution failed/);
  });
});