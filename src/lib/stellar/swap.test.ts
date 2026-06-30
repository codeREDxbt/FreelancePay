import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/stellar/client', () => ({
  horizonServer: {
    loadAccount: vi.fn(),
    strictReceivePaths: vi.fn(),
    strictSendPaths: vi.fn(),
  },
}));

vi.mock('@/constants/stellar', () => ({
  STELLAR_CONFIG: {
    network: 'Test SDF Network ; September 2015',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    usdc: { code: 'USDC', issuer: 'GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER' },
    contractId: 'CABC',
    anchorUrl: 'https://testanchor.stellar.org',
  },
}));

import { hasTrustline, buildTrustlineTransaction, getSwapQuote, buildSwapTransaction } from '@/lib/stellar/swap';
import { horizonServer } from '@/lib/stellar/client';
import { Asset } from '@stellar/stellar-sdk';

const GBDUMMY = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const GABC = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const mockAccount = (balances: unknown[]) => {
  const account: { [key: string]: unknown } = {
    subentryCount: 0,
    thresholds: { lowThreshold: 0, medThreshold: 0, highThreshold: 0 },
    flags: { authRequired: false, authRevocable: false, authImmutable: false, authClawbackEnabled: false },
    homeDomain: '',
    inflationDest: '',
    signers: [],
    data: {},
    balances,
    accountId: () => GABC,
    sequenceNumber: () => '1',
    incrementSequenceNumber: () => '2',
  };
  return account;
};

describe('swap helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('hasTrustline', () => {
    it('returns true when the matching trustline balance exists', async () => {
      vi.mocked(horizonServer.loadAccount).mockResolvedValue(mockAccount([
        { asset_type: 'native', balance: '10' },
        { asset_type: 'credit_alphanum4', asset_code: 'USDC', asset_issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', balance: '5' },
      ]) as never);

      const result = await hasTrustline({
        publicKey: GABC,
        assetCode: 'USDC',
        assetIssuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      });

      expect(result).toBe(true);
    });

    it('returns false when no trustline exists', async () => {
      vi.mocked(horizonServer.loadAccount).mockResolvedValue(mockAccount([
        { asset_type: 'native', balance: '10' },
      ]) as never);

      const result = await hasTrustline({
        publicKey: GABC,
        assetCode: 'USDC',
        assetIssuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      });

      expect(result).toBe(false);
    });

    it('returns false when account loading throws', async () => {
      vi.mocked(horizonServer.loadAccount).mockRejectedValue(new Error('not found'));
      const result = await hasTrustline({
        publicKey: GABC,
        assetCode: 'USDC',
        assetIssuer: 'GXYZ',
      });
      expect(result).toBe(false);
    });
  });

  describe('buildTrustlineTransaction', () => {
    it('returns a non-empty XDR string', async () => {
      vi.mocked(horizonServer.loadAccount).mockResolvedValue(mockAccount([
        { asset_type: 'native', balance: '10' },
      ]) as never);

      const xdr = await buildTrustlineTransaction({
        publicKey: GABC,
        assetCode: 'USDC',
        assetIssuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      });

      expect(typeof xdr).toBe('string');
      expect(xdr.length).toBeGreaterThan(0);
    });
  });

  describe('getSwapQuote', () => {
    it('returns a parsed strict-send quote computed from Horizon', async () => {
      vi.mocked(horizonServer.strictSendPaths).mockReturnValue({
        call: vi.fn().mockResolvedValue({
          records: [
            {
              source_amount: '50',
              destination_amount: '5',
              path: [{ asset_type: 'native' }],
            },
          ],
        }),
      } as never);

      const quote = await getSwapQuote({
        sourceAsset: Asset.native(),
        destAsset: new Asset('USDC', GBDUMMY),
        sourceAmount: '50',
        destAmount: '5',
        publicKey: GABC,
        kind: 'send',
      });

      expect(quote).not.toBeNull();
      expect(quote?.kind).toBe('send');
      expect(quote?.sourceAmount).toBe('50');
      expect(quote?.destinationAmount).toBe('5');
      // Native endpoints should be stripped from the path
      expect(quote?.path.length).toBe(0);
    });

    it('returns a parsed strict-receive quote', async () => {
      vi.mocked(horizonServer.strictReceivePaths).mockReturnValue({
        call: vi.fn().mockResolvedValue({
          records: [
            {
              source_amount: '100',
              destination_amount: '5',
              path: [{ asset_type: 'native' }],
            },
          ],
        }),
      } as never);

      const quote = await getSwapQuote({
        sourceAsset: Asset.native(),
        destAsset: new Asset('USDC', GBDUMMY),
        sourceAmount: '5',
        destAmount: '5',
        publicKey: GABC,
        kind: 'receive',
      });

      expect(quote).not.toBeNull();
      expect(quote?.kind).toBe('receive');
      expect(quote?.sourceAmount).toBe('100');
      expect(quote?.destinationAmount).toBe('5');
    });

    it('returns null when the typed amount is zero', async () => {
      const quote = await getSwapQuote({
        sourceAsset: Asset.native(),
        destAsset: new Asset('USDC', GBDUMMY),
        sourceAmount: '0',
        destAmount: '0',
        publicKey: GABC,
        kind: 'send',
      });
      expect(quote).toBeNull();
    });
  });

  describe('buildSwapTransaction', () => {
    it('returns unsigned XDR for a path payment strict-send', async () => {
      vi.mocked(horizonServer.loadAccount).mockResolvedValue(mockAccount([
        { asset_type: 'native', balance: '100' },
      ]) as never);

      const xdr = await buildSwapTransaction({
        kind: 'send',
        sourceAsset: Asset.native(),
        sourceAmount: '50',
        destAsset: new Asset('USDC', GBDUMMY),
        destAmount: '5',
        publicKey: GABC,
        path: [],
      });

      expect(typeof xdr).toBe('string');
      expect(xdr.length).toBeGreaterThan(0);
    });

    it('returns unsigned XDR for a path payment strict-receive', async () => {
      vi.mocked(horizonServer.loadAccount).mockResolvedValue(mockAccount([
        { asset_type: 'native', balance: '100' },
      ]) as never);

      const xdr = await buildSwapTransaction({
        kind: 'receive',
        sourceAsset: Asset.native(),
        sourceAmount: '100',
        destAsset: new Asset('USDC', GBDUMMY),
        destAmount: '5',
        publicKey: GABC,
        path: [],
      });

      expect(typeof xdr).toBe('string');
      expect(xdr.length).toBeGreaterThan(0);
    });
  });
});
