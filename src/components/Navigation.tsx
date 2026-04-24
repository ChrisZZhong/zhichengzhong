'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Bot } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const navLinksEn = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/experience', label: 'Experience' },
  { href: '/connect', label: 'Connect' },
];

const navLinksZh = [
  { href: '/', label: '首页' },
  { href: '/blog', label: '博客' },
  { href: '/experience', label: '经历' },
  { href: '/connect', label: '联系' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, toggle } = useLanguage();
  const navLinks = lang === 'en' ? navLinksEn : navLinksZh;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-space/90 backdrop-blur-md border-b border-card-border shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/30 flex items-center justify-center group-hover:border-accent-cyan/60 transition-all duration-300">
            <span className="text-accent-cyan font-bold text-sm font-mono">Z</span>
          </div>
          <span className="font-semibold text-text-primary group-hover:text-accent-cyan transition-colors text-sm tracking-wide">
            Zhicheng
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${pathname === href || (href !== '/' && pathname.startsWith(href)) ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggle}
            className="px-3 py-1.5 text-xs font-mono font-semibold rounded-full border border-card-border text-text-muted hover:border-accent-cyan/40 hover:text-accent-cyan transition-all duration-200 tracking-widest"
          >
            {lang === 'en' ? '中文' : 'EN'}
          </button>
          <Link
            href="/agent"
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 ${
              pathname === '/agent'
                ? 'bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan'
                : 'border-accent-purple/30 text-accent-purple hover:bg-accent-purple/10 hover:border-accent-purple/60'
            }`}
          >
            <Bot size={14} />
            AI Agent
          </Link>
          <Link
            href="/connect"
            className="px-4 py-1.5 text-sm font-medium rounded-full border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 hover:border-accent-cyan/60 transition-all duration-200"
          >
            {lang === 'en' ? 'Get in Touch' : '联系我'}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-text-muted hover:text-text-primary transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-space/95 backdrop-blur-md border-b border-card-border px-6 py-4 flex flex-col gap-4">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`text-sm font-medium transition-colors ${
                pathname === href || (href !== '/' && pathname.startsWith(href))
                  ? 'text-accent-cyan'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/agent"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              pathname === '/agent' ? 'text-accent-purple' : 'text-text-muted hover:text-accent-purple'
            }`}
          >
            <Bot size={14} />
            AI Agent
          </Link>
          <button
            onClick={() => { toggle(); setMobileOpen(false); }}
            className="text-sm font-mono font-semibold text-text-muted hover:text-accent-cyan transition-colors text-left"
          >
            {lang === 'en' ? '切换中文' : 'Switch to EN'}
          </button>
        </div>
      )}
    </nav>
  );
}
