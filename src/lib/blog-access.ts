import { createHash, timingSafeEqual } from 'node:crypto';

export const passwordSalt = 'd2ef779cf5c5f932238cb41ed6fec894';
const verifier = Buffer.from('088416eba7062e7bd0089ca6586ec7e322c7c462645e4b299a7c43a1f2641595', 'hex');
export const accessCookie = 'blog-interviews-access';

export function validAccessProof(value?: string): boolean {
  if (!value || !/^[a-f0-9]{64}$/.test(value)) return false;
  const digest = createHash('sha256').update(Buffer.from(value, 'hex')).digest();
  return timingSafeEqual(digest, verifier);
}
