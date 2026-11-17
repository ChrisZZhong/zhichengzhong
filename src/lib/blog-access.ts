import { createHash, timingSafeEqual } from 'node:crypto';

export const passwordSalt = 'ff28f8a10a28b84fc7c012bf5364617d';
const verifier = Buffer.from('bcb8feca3c0a844bfd777f9e72b96e049535b681127c9d61756acd5d94d71e36', 'hex');
export const accessCookie = 'blog-interviews-access';

export function validAccessProof(value?: string): boolean {
  if (!value || !/^[a-f0-9]{64}$/.test(value)) return false;
  const digest = createHash('sha256').update(Buffer.from(value, 'hex')).digest();
  return timingSafeEqual(digest, verifier);
}
