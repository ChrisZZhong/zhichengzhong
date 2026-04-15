'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, Github, Linkedin, Mail, ExternalLink, ChevronRight, Calendar, Tag } from 'lucide-react';
import type { PostMeta } from '@/types/post';

interface Props {
  recentPosts: PostMeta[];
}

export default function HomeClient({ recentPosts }: Props) {
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax on scroll
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onScroll = () => {
      const y = window.scrollY;
      hero.style.transform = `translateY(${y * 0.3}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ─── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid">
        {/* Animated orbs */}
        <div ref={heroRef} className="absolute inset-0 pointer-events-none will-change-transform">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        {/* Subtle vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-space pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Avatar */}
          <div
            className="flex-shrink-0 flex flex-col items-center gap-4"
            style={{ animation: 'fade-in 0.8s ease-out 0.2s both' }}
          >
            <div className="relative">
              {/* Outer ring */}
              <div className="avatar-ring w-52 h-52 lg:w-64 lg:h-64">
                <div className="avatar-ring-inner w-full h-full">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src="/avatar.jpg"
                      alt="Zhicheng Zhong"
                      fill
                      className="object-cover"
                      priority
                    />
                    {/* Scan line */}
                    <div className="scan-overlay">
                      <div className="scan-line" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Status dot */}
              <div className="absolute bottom-4 right-4 w-4 h-4 bg-green-400 rounded-full border-2 border-space shadow-lg shadow-green-400/50 animate-pulse" />
            </div>

            {/* Mini social links below avatar */}
            <div className="flex gap-3">
              <a
                href="https://github.com/YOUR_GITHUB"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 glass-card flex items-center justify-center text-text-muted hover:text-accent-cyan hover:border-accent-cyan/30 transition-all"
              >
                <Github size={16} />
              </a>
              <a
                href="https://linkedin.com/in/YOUR_LINKEDIN"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 glass-card flex items-center justify-center text-text-muted hover:text-accent-cyan hover:border-accent-cyan/30 transition-all"
              >
                <Linkedin size={16} />
              </a>
              <a
                href="mailto:YOUR_EMAIL"
                className="w-9 h-9 glass-card flex items-center justify-center text-text-muted hover:text-accent-cyan hover:border-accent-cyan/30 transition-all"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Label */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent-cyan/20 bg-accent-cyan/5 text-accent-cyan text-xs font-mono font-medium mb-6 tracking-widest"
              style={{ animation: 'slide-up 0.6s ease-out 0.1s both' }}
            >
              <span className="w-1.5 h-1.5 bg-accent-cyan rounded-full animate-pulse" />
              AVAILABLE FOR OPPORTUNITIES
            </div>

            {/* Name */}
            <h1
              className="text-5xl lg:text-7xl font-black mb-4 leading-tight"
              style={{ animation: 'slide-up 0.6s ease-out 0.2s both' }}
            >
              <span className="text-text-primary">Zhicheng</span>
              <br />
              <span className="gradient-text">Zhong</span>
            </h1>

            {/* Title */}
            <p
              className="text-xl lg:text-2xl text-text-muted font-medium mb-6"
              style={{ animation: 'slide-up 0.6s ease-out 0.3s both' }}
            >
              Software Engineer
              <span className="text-accent-cyan mx-2">/</span>
              System Design
              <span className="text-accent-cyan mx-2">/</span>
              Backend
            </p>

            {/* Bio */}
            <p
              className="text-text-muted leading-relaxed max-w-xl mb-8 text-base lg:text-lg"
              style={{ animation: 'slide-up 0.6s ease-out 0.4s both' }}
            >
              Building scalable distributed systems and exploring the intersection of
              software engineering and system architecture. Passionate about microservices,
              Kafka, and solving complex engineering challenges.
            </p>

            {/* Tech stack chips */}
            <div
              className="flex flex-wrap gap-2 mb-10 justify-center lg:justify-start"
              style={{ animation: 'slide-up 0.6s ease-out 0.5s both' }}
            >
              {['Java', 'Spring Boot', 'Kafka', 'Redis', 'System Design', 'Distributed Systems'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-xs font-mono font-medium rounded border border-accent-blue/20 bg-accent-blue/5 text-slate-400 hover:border-accent-cyan/30 hover:text-accent-cyan transition-all"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
              style={{ animation: 'slide-up 0.6s ease-out 0.6s both' }}
            >
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/30 text-accent-cyan font-semibold text-sm hover:from-accent-cyan/30 hover:to-accent-purple/30 hover:border-accent-cyan/50 transition-all duration-200 glow-cyan"
              >
                Read My Blog <ChevronRight size={16} />
              </Link>
              <Link
                href="/connect"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-card-border text-text-muted font-semibold text-sm hover:border-accent-purple/30 hover:text-text-primary transition-all duration-200"
              >
                Get in Touch <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-40">
          <span className="text-xs text-text-muted font-mono tracking-widest">SCROLL</span>
          <ArrowDown size={16} className="text-accent-cyan" />
        </div>
      </section>

      {/* ─── BLOG PREVIEW ──────────────────────────────────────────── */}
      <section className="py-24 px-6 relative" id="blog">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label="FROM THE BLOG"
            title="Recent Posts"
            subtitle="Notes on system design, distributed systems, and software engineering."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {recentPosts.slice(0, 6).map((post, i) => (
              <PostCard key={post.slug} post={post} index={i} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-card-border text-text-muted text-sm font-medium hover:border-accent-cyan/30 hover:text-accent-cyan transition-all"
            >
              View All Posts <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── EXPERIENCE PREVIEW ────────────────────────────────────── */}
      <section className="py-24 px-6 relative" id="experience">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label="CAREER"
            title="Experience"
            subtitle="A snapshot of where I've worked and what I've built."
          />

          <div className="mt-12 grid md:grid-cols-2 gap-5">
            {[
              {
                company: 'Your Company',
                role: 'Software Engineer',
                period: '2023 – Present',
                tags: ['Java', 'Spring Boot', 'Kafka'],
                placeholder: true,
              },
              {
                company: 'Previous Company',
                role: 'Backend Developer',
                period: '2021 – 2023',
                tags: ['Microservices', 'Redis', 'Docker'],
                placeholder: true,
              },
            ].map((exp) => (
              <div key={exp.company} className="glass-card p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-text-primary">{exp.company}</h3>
                    <p className="text-accent-cyan text-sm">{exp.role}</p>
                  </div>
                  <span className="text-xs text-text-muted font-mono">{exp.period}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {exp.tags.map((t) => (
                    <span key={t} className="tag-badge">{t}</span>
                  ))}
                </div>
                {exp.placeholder && (
                  <p className="text-xs text-text-muted mt-3 italic">Details coming soon...</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/experience"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-card-border text-text-muted text-sm font-medium hover:border-accent-cyan/30 hover:text-accent-cyan transition-all"
            >
              Full Experience <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CONNECT PREVIEW ───────────────────────────────────────── */}
      <section className="py-24 px-6 relative" id="connect">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label="LET'S TALK"
            title="Connect"
            subtitle="Open to new opportunities, collaborations, and conversations."
          />

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {[
              { icon: Mail, label: 'Email', href: 'mailto:YOUR_EMAIL', value: 'your@email.com' },
              { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/in/YOUR_LINKEDIN', value: 'linkedin.com/in/...' },
              { icon: Github, label: 'GitHub', href: 'https://github.com/YOUR_GITHUB', value: 'github.com/...' },
            ].map(({ icon: Icon, label, href, value }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="glass-card p-5 flex items-center gap-4 min-w-[220px] group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 border border-accent-cyan/20 flex items-center justify-center group-hover:border-accent-cyan/40 transition-all">
                  <Icon size={18} className="text-accent-cyan" />
                </div>
                <div>
                  <p className="text-xs text-text-muted font-medium">{label}</p>
                  <p className="text-sm text-text-primary">{value}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/connect"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-card-border text-text-muted text-sm font-medium hover:border-accent-cyan/30 hover:text-accent-cyan transition-all"
            >
              All Contact Methods <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-card-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} Zhicheng Zhong. Built with Next.js & ❤️
          </p>
          <p className="text-text-muted text-xs font-mono">
            Deployed on Vercel
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────────── */

function SectionHeader({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center mb-2">
      <p className="text-xs font-mono font-semibold text-accent-cyan tracking-[0.2em] mb-3 uppercase">
        {label}
      </p>
      <h2 className="text-3xl lg:text-4xl font-black text-text-primary mb-4">{title}</h2>
      <p className="text-text-muted text-base max-w-xl mx-auto">{subtitle}</p>
    </div>
  );
}

function PostCard({ post, index }: { post: PostMeta; index: number }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="glass-card p-5 flex flex-col gap-3 group"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="tag-badge">{post.tag}</span>
        <span className="text-xs text-text-muted font-mono flex items-center gap-1">
          <Calendar size={11} />
          {post.date}
        </span>
      </div>
      <h3 className="font-bold text-text-primary text-sm leading-snug group-hover:text-accent-cyan transition-colors line-clamp-2">
        {post.title}
      </h3>
      {post.description && post.description !== post.title && (
        <p className="text-xs text-text-muted line-clamp-2">{post.description}</p>
      )}
      <div className="flex items-center gap-1 text-xs text-accent-cyan font-medium mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
        Read more <ChevronRight size={12} />
      </div>
    </Link>
  );
}
