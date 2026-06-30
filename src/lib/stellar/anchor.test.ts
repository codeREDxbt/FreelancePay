import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initiateAnchorFlow, getAnchorInfo } from '@/lib/stellar/anchor';

const ANCHOR = 'https://testanchor.stellar.org';
const GABC = 'GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER';

describe('anchor (SEP-24)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getAnchorInfo', () => {
    it('returns parsed info on success', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ deposit: { USDC: { enabled: true } } }),
      } as never);

      const info = await getAnchorInfo(ANCHOR);
      expect(info).not.toBeNull();
      expect(info?.deposit.USDC.enabled).toBe(true);
    });

    it('returns null on failure', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, status: 500 } as never);
      const info = await getAnchorInfo(ANCHOR);
      expect(info).toBeNull();
    });
  });

  describe('initiateAnchorFlow', () => {
    it('returns a redirect URL on successful deposit', async () => {
      // /sep24/info response (success)
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          deposit: { USDC: { enabled: true } },
          withdraw: { USDC: { enabled: true } },
        }),
      } as never);

      // POST /sep24/transactions/deposit/interactive
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ url: 'https://testanchor.stellar.org/redirect', id: 'tx-1' }),
        text: async () => '',
      } as never);

      const result = await initiateAnchorFlow({
        anchorUrl: ANCHOR,
        type: 'deposit',
        assetCode: 'USDC',
        publicKey: GABC,
      });

      expect(result.url).toBe('https://testanchor.stellar.org/redirect');
      expect(result.id).toBe('tx-1');
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('throws when anchor returns an error', async () => {
      // /info succeeds — both deposit and withdraw enabled
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ deposit: { USDC: { enabled: true } }, withdraw: { USDC: { enabled: true } } }),
      } as never);

      // POST interactive fails
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
        json: async () => ({}),
      } as never);

      await expect(
        initiateAnchorFlow({
          anchorUrl: ANCHOR,
          type: 'withdraw',
          assetCode: 'USDC',
          publicKey: GABC,
        })
      ).rejects.toThrow(/500/);
    });

    it('throws if anchor does not support the asset', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ deposit: { USDC: { enabled: false } }, withdraw: {} }),
      } as never);

      await expect(
        initiateAnchorFlow({
          anchorUrl: ANCHOR,
          type: 'deposit',
          assetCode: 'USDC',
          publicKey: GABC,
        })
      ).rejects.toThrow(/not supported/i);
    });
  });
});
