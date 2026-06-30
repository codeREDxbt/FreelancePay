import crypto from 'crypto';

export function signNonce(nonce: string, expiresAt: number): string {
  const secret = process.env.JWT_SECRET || process.env.FIREBASE_PRIVATE_KEY || 'fallback_dev_secret';
  const payload = `${nonce}.${expiresAt}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  return `${payload}.${signature}`;
}

export function verifySignedNonce(token: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [nonce, expiresAtStr, signature] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);
  
  if (Date.now() > expiresAt) return null;
  
  const expectedToken = signNonce(nonce, expiresAt);
  if (expectedToken !== token) return null;
  
  return nonce;
}

export function createFirebaseCustomToken(uid: string): string {
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
  
  if (!privateKey || !clientEmail) {
    if (process.env.NODE_ENV !== 'production') {
      return `mock-token-${Date.now()}`;
    }
    throw new Error("Missing FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL");
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
    iat: now,
    exp: now + 3600,
    uid: uid,
  };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  
  const signInput = `${encodedHeader}.${encodedPayload}`;
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signInput);
  const signature = sign.sign(privateKey, 'base64url');
  
  return `${signInput}.${signature}`;
}
