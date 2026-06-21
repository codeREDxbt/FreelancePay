import { describe, it, expect } from 'vitest';
import {
  NONCE_TTL_MS,
  NonceValidationError,
  assertValidNonceInputs,
  buildNonceDocId,
  buildNonceRecord,
  isNonceValid,
} from '@/lib/auth/nonce';

describe('nonce helpers', () => {
  describe('buildNonceDocId', () => {
    it('combines publicKey and nonce', () => {
      expect(buildNonceDocId('GABC', 'abc123')).toBe('GABC_abc123');
    });
  });

  describe('buildNonceRecord', () => {
    it('produces a record with a TTL 10 minutes in the future', () => {
      const now = 1_000_000;
      const record = buildNonceRecord('GABC', 'xyz', now);
      expect(record.publicKey).toBe('GABC');
      expect(record.nonce).toBe('xyz');
      expect(record.createdAt).toBe(now);
      expect(record.expiresAt).toBe(now + NONCE_TTL_MS);
      expect(record.consumed).toBe(false);
      expect(NONCE_TTL_MS).toBe(600_000);
    });
  });

  describe('isNonceValid', () => {
    const base = { publicKey: 'GABC', nonce: 'xyz', createdAt: 0, consumed: false, expiresAt: 0 };

    it('returns false for undefined records', () => {
      expect(isNonceValid(undefined)).toBe(false);
    });

    it('returns false for consumed records', () => {
      expect(isNonceValid({ ...base, expiresAt: Date.now() + 1000, consumed: true })).toBe(false);
    });

    it('returns false for expired records', () => {
      expect(isNonceValid({ ...base, expiresAt: 100 })).toBe(false);
    });

    it('returns true for fresh unconsumed records', () => {
      expect(isNonceValid({ ...base, expiresAt: Date.now() + 1000 })).toBe(true);
    });
  });

  describe('assertValidNonceInputs', () => {
    it('passes through valid input', () => {
      assertValidNonceInputs({ publicKey: 'GABC', nonce: 'xyz' });
    });

    it.each([
      { publicKey: '', nonce: 'xyz' },
      { publicKey: 'GABC', nonce: '' },
      { publicKey: 123, nonce: 'xyz' },
      { publicKey: undefined, nonce: 'xyz' },
      { publicKey: 'GABC', nonce: null },
    ])('rejects invalid input (%o)', (input) => {
      expect(() => assertValidNonceInputs(input)).toThrow(NonceValidationError);
    });
  });
});