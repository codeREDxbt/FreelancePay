import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { adminDb } from '@/lib/firebase/admin';
import {
  NonceValidationError,
  assertValidNonceInputs,
  buildNonceDocId,
  buildNonceRecord,
  isNonceValid,
} from '@/lib/auth/nonce';
import { rateLimit, rateLimitHeaders } from '@/lib/auth/rate-limit';

const NONCE_COLLECTION = 'auth_nonces';

export async function GET(req: Request) {
  const rl = rateLimit(req);
  const headers = rateLimitHeaders(rl);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers }
    );
  }

  try {
    const nonce = randomBytes(32).toString('hex');
    return NextResponse.json({ nonce }, { headers });
  } catch {
    return NextResponse.json({ error: 'Failed to generate nonce' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const rl = rateLimit(req);
  const headers = rateLimitHeaders(rl);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers }
    );
  }

  try {
    const body = await req.json();
    assertValidNonceInputs(body);

    const now = Date.now();
    const docId = buildNonceDocId(body.publicKey, body.nonce);
    const docRef = adminDb.collection(NONCE_COLLECTION).doc(docId);
    const existing = await docRef.get();

    if (existing.exists) {
      const data = existing.data() as Record<string, unknown> | undefined;
      if (data && data.consumed === true) {
        return NextResponse.json(
          { error: 'Nonce has already been used' },
          { status: 409 }
        );
      }
      if (data && data.expiresAt && typeof data.expiresAt === 'number' && data.expiresAt < now) {
        return NextResponse.json(
          { error: 'Nonce has expired. Request a new one.' },
          { status: 410 }
        );
      }
    }

    const record = buildNonceRecord(body.publicKey, body.nonce, now);
    if (!isNonceValid(record, now)) {
      return NextResponse.json({ error: 'Invalid nonce' }, { status: 400 });
    }

    await docRef.set(record);

    return NextResponse.json({ success: true }, { headers });
  } catch (err) {
    if (err instanceof NonceValidationError) {
      return NextResponse.json({ error: 'Missing publicKey or nonce' }, { status: 400 });
    }
    console.error('Auth nonce error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to store nonce';
    return NextResponse.json(
      { error: process.env.NODE_ENV !== 'production' ? errorMessage : 'Failed to store nonce' },
      { status: 500 }
    );
  }
}