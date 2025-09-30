import { createDecipheriv, createCipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export interface CipherPayload {
  cipherText: string;
  iv: string;
  authTag: string;
}

export function encrypt(secret: string, plainText: string): CipherPayload {
  const key = Buffer.from(secret, 'utf-8');
  if (key.length !== 32) {
    throw new Error('Encryption secret must be 32 bytes for AES-256-GCM');
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    cipherText: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64')
  };
}

export function decrypt(secret: string, payload: CipherPayload): string {
  const key = Buffer.from(secret, 'utf-8');
  if (key.length !== 32) {
    throw new Error('Encryption secret must be 32 bytes for AES-256-GCM');
  }

  const iv = Buffer.from(payload.iv, 'base64');
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.cipherText, 'base64')),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}
