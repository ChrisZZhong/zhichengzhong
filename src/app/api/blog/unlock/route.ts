import { NextResponse } from 'next/server';
import { accessCookie, validAccessProof } from '@/lib/blog-access';

export async function POST(request: Request) {
  const proof = request.headers.get('X-Blog-Proof') ?? '';
  if (!validAccessProof(proof)) return new Response(null, { status: 401 });

  const response = new NextResponse(null, {
    status: 204,
    headers: { 'Cache-Control': 'private, no-store' },
  });
  response.cookies.set(accessCookie, proof, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/blog',
  });
  return response;
}
