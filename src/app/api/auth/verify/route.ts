import { NextResponse } from 'next/server';
import { Keypair } from '@stellar/stellar-sdk';
import { createHash } from 'crypto';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { rateLimit, rateLimitHeaders } from '@/lib/auth/rate-limit';

const NONCE_COLLECTION = 'auth_nonces';

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
    const { publicKey, signature, nonce } = await req.json();

    if (!publicKey || !signature || !nonce) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const nonceDocId = `${publicKey}_${nonce}`;
    const nonceRef = adminDb.collection(NONCE_COLLECTION).doc(nonceDocId);
    const nonceDoc = await nonceRef.get();

    if (!nonceDoc.exists) {
      return NextResponse.json(
        { error: 'Nonce not found. Request /api/auth/nonce first.' },
        { status: 401 }
      );
    }

    const nonceData = nonceDoc.data();
    if (!nonceData || nonceData.consumed) {
      return NextResponse.json(
        { error: 'Nonce has already been consumed' },
        { status: 401 }
      );
    }

    if (nonceData.expiresAt < Date.now()) {
      return NextResponse.json(
        { error: 'Nonce has expired. Request a new one.' },
        { status: 401 }
      );
    }

    let signatureBuffer: Buffer;
    try {
      signatureBuffer = Buffer.from(signature, 'base64');
    } catch {
      return NextResponse.json(
        { error: 'Invalid signature encoding' },
        { status: 400 }
      );
    }

    const messageBuffer = Buffer.from('Stellar Signed Message:\n' + nonce);
    const dataBuffer = createHash('sha256').update(messageBuffer).digest();

    let keypair: Keypair;
    try {
      keypair = Keypair.fromPublicKey(publicKey);
    } catch {
      return NextResponse.json(
        { error: 'Invalid public key' },
        { status: 400 }
      );
    }

    const isValid = keypair.verify(dataBuffer, signatureBuffer);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    await nonceRef.update({ consumed: true, consumedAt: Date.now() });

    const customToken = await adminAuth.createCustomToken(publicKey);

    return NextResponse.json({ customToken }, { headers });
  } catch (error) {
    console.error('Auth verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: process.env.NODE_ENV !== 'production' ? errorMessage : 'Internal server error' },
      { status: 500 }
    );
  }
}