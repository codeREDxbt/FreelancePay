import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@stellar/stellar-sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@stellar/stellar-sdk')>();
  return {
    ...actual,
    TransactionBuilder: {
      fromXDR: vi.fn(() => ({ kind: "tx-from-xdr" })),
    },
  };
});

vi.mock('@/lib/stellar/client', () => ({
  sorobanServer: {
    sendTransaction: vi.fn(),
    getTransaction: vi.fn(),
  },
  horizonServer: {
    submitTransaction: vi.fn(),
  },
}));

import { submitSignedTransaction, submitHorizonTransaction } from '@/lib/stellar/utils';
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
    sendMock.mockResolvedValue({ status: 'SUCCESS', hash: 'abc' } as never);
    let callCount = 0;
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

    await expect(submitSignedTransaction('xdr')).rejects.toThrow(/Transaction execution failed/);
  });
});

describe('submitHorizonTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('parses XDR, submits via horizon server, and asserts success', async () => {
    const { horizonServer } = await import('@/lib/stellar/client');
    const mockSubmit = vi.mocked(horizonServer.submitTransaction);
    mockSubmit.mockResolvedValueOnce({ hash: 'horizon-hash', successful: true } as never);

    const result = await submitHorizonTransaction('xdr');
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({ kind: 'tx-from-xdr' });
    expect(result.hash).toBe('horizon-hash');
    expect(result.successful).toBe(true);
  });

  it('throws when Horizon returns successful:false (tx_failed)', async () => {
    const { horizonServer } = await import('@/lib/stellar/client');
    const mockSubmit = vi.mocked(horizonServer.submitTransaction);
    mockSubmit.mockResolvedValueOnce({
      hash: 'failed-hash',
      successful: false,
      result_xdr: 'AAAA',
    } as never);

    await expect(submitHorizonTransaction('xdr')).rejects.toThrow(/Classic transaction failed/);
  });
});