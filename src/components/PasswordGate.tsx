'use client';

import { useState, type FormEvent } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function PasswordGate({ salt }: { salt: string }) {
  const { lang } = useLanguage();
  const zh = lang === 'zh';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<'password' | 'connection' | null>(null);

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const password = String(new FormData(event.currentTarget).get('password'));
    setBusy(true);
    setError(null);
    try {
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
      const saltBytes = Uint8Array.from(salt.match(/../g)!, byte => parseInt(byte, 16));
      const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', iterations: 600000, salt: saltBytes }, key, 256);
      const proof = Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('');
      const result = await fetch('/api/blog/unlock', { method: 'POST', headers: { 'X-Blog-Proof': proof } });
      if (result.ok) {
        window.location.reload();
        return;
      }
      setError(result.status === 401 ? 'password' : 'connection');
    } catch {
      setError('connection');
    }
    setBusy(false);
  }

  return (
    <form onSubmit={unlock} className="glass-card max-w-md p-6 space-y-4">
      <label htmlFor="blog-password" className="block font-semibold">
        {zh ? '输入密码以阅读面试文章' : 'Enter the password to read the interview posts'}
      </label>
      <input id="blog-password" name="password" type="password" required autoComplete="current-password"
        onChange={() => setError(null)} aria-invalid={error === 'password'}
        className="w-full rounded-lg border border-card-border bg-space px-3 py-2 text-text-primary focus:border-accent-cyan" />
      {error && <p role="alert" className="text-sm text-red-400">{error === 'password'
        ? (zh ? '密码不正确，请重试。' : 'Incorrect password. Try again.')
        : (zh ? '暂时无法解锁，请重试。' : 'Could not unlock the article. Try again.')}</p>}
      <button type="submit" disabled={busy} className="rounded-lg bg-accent-cyan px-4 py-2 text-space font-semibold disabled:opacity-60">
        {busy ? (zh ? '验证中…' : 'Checking…') : (zh ? '解锁' : 'Unlock')}
      </button>
    </form>
  );
}
