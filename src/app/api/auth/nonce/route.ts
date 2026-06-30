import { NextResponse } from 'next/server';
import {
  NonceValidationError,
  assertValidNonceInputs,
  buildNonceDocId,
  buildNonceRecord,
  isNonceValid,
} from '@/lib/auth/nonce';
import { rateLimit, rateLimitHeaders } from '@/lib/auth/rate-limit';

const NONCE_COLLECTION = 'auth_nonces';

// We do not export const dynamic = 'force-dynamic' just in case it breaks something,
// Next.js infers dynamic from the request object anyway.

export async function GET(req: Request) {
  try {
    const rl = rateLimit(req);
    const headers = rateLimitHeaders(rl);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers }
      );
    }

    let nonce = '';
    try {
      const array = new Uint8Array(32);
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(array);
        nonce = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
      } else {
        // Fallback for extremely old environments where global crypto is missing
        nonce = Array.from({ length: 32 }).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
      }
    } catch {
      // Ultimate fallback
      nonce = Array.from({ length: 32 }).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
    }
    
    return NextResponse.json({ nonce }, { headers });
  } catch (err) {
    console.error('Nonce GET error:', err);
    return NextResponse.json({ error: 'Failed to generate nonce' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const rl = rateLimit(req);
    const headers = rateLimitHeaders(rl);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers }
      );
    }

    const body = await req.json();
    assertValidNonceInputs(body);

    const now = Date.now();
    const docId = buildNonceDocId(body.publicKey, body.nonce);
    
    // Dynamically import adminDb to prevent it from crashing the entire module 
    // at load time if firebase-admin has environmental issues.
    const { adminDb } = await import('@/lib/firebase/admin');
    
    const docRef = adminDb.collection(NONCE_COLLECTION).doc(docId);
    const existing = await docRef.get();

    if (existing.exists) {
      const data = existing.data() as Record<string, unknown> | undefined;
      if (data && data.consumed === true) {
        return NextResponse.json(
          { error: 'Nonce has already been used' },
          { status: 409, headers }
        );
      }
      if (data && data.expiresAt && typeof data.expiresAt === 'number' && data.expiresAt < now) {
        return NextResponse.json(
          { error: 'Nonce has expired. Request a new one.' },
          { status: 410, headers }
        );
      }
    }

    const record = buildNonceRecord(body.publicKey, body.nonce, now);
    if (!isNonceValid(record, now)) {
      return NextResponse.json({ error: 'Invalid nonce' }, { status: 400, headers });
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