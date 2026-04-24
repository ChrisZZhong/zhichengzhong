'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, Github, Linkedin, Mail, ExternalLink, ChevronRight, Calendar, Bot, Sparkles } from 'lucide-react';
import type { PostMeta } from '@/types/post';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  recentPosts: PostMeta[];
}

const translations = {
  en: {
    available: 'AVAILABLE FOR OPPORTUNITIES',
    title1: 'Software Developer',
    title2: 'Distributed Systems',
    title3: 'AI & RAG',
    bio: 'M.S. Computer Science @ Georgetown. Building event-driven microservices, scalable distributed systems, and AI-powered tools. Currently at Madison-Davis, previously at Fiserv and Tencent.',
    readBlog: 'Read My Blog',
    getInTouch: 'Get in Touch',
    agentBadge: 'NEW — AI PORTFOLIO AGENT',
    agentTitle: 'Chat with My AI Agent',
    agentDesc: 'Powered by Gemini 2.5 Flash + RAG. Ask anything about my blog posts, explore my technical writing, or schedule a meeting — all through a streaming AI chat interface.',
    tryAgent: 'Try the Agent',
    browseBlog: 'Browse Blog',
    fromBlog: 'FROM THE BLOG',
    recentPosts: 'Recent Posts',
    recentDesc: 'Notes on system design, distributed systems, and software engineering.',
    viewAll: 'View All Posts',
    career: 'CAREER',
    experience: 'Experience',
    expDesc: "A snapshot of where I've worked and what I've built.",
    fullExp: 'Full Experience',
    letsTalk: "LET'S TALK",
    connect: 'Connect',
    connectDesc: 'Open to new opportunities, collaborations, and conversations.',
    allContact: 'All Contact Methods',
    footer: 'Built with Next.js & ❤️',
    deployed: 'Deployed on Vercel',
    expEntries: [
      {
        company: 'Madison-Davis',
        role: 'Software Developer',
        period: 'Oct 2024 – Present',
        location: 'New York, NY',
        tags: ['Java', 'Spring Boot', 'Kafka', 'Kubernetes', 'Debezium', 'Microservices'],
      },
      {
        company: 'Fiserv',
        role: 'Software Engineer',
        period: 'Jul 2023 – Oct 2024',
        location: 'Berkeley Heights, NJ',
        tags: ['Java', 'JavaEE', 'Redis', 'Kafka', 'Kubernetes', 'Helm'],
      },
      {
        company: 'Tencent',
        role: 'Backend Developer Intern',
        period: 'Jul 2020 – Oct 2020',
        location: 'Shenzhen, China',
        tags: ['Go', 'gRPC', 'Druid', 'AIOps'],
      },
    ],
  },
  zh: {
    available: '正在寻找新机会',
    title1: '软件工程师',
    title2: '分布式系统',
    title3: 'AI & RAG',
    bio: '乔治城大学计算机科学硕士。专注于事件驱动微服务、分布式系统和 AI 工具的构建。目前就职于 Madison-Davis，曾任职于 Fiserv 和 Tencent。',
    readBlog: '阅读博客',
    getInTouch: '联系我',
    agentBadge: '新功能 — AI 对话助手',
    agentTitle: '与我的 AI 助手对话',
    agentDesc: '基于 Gemini 2.5 Flash + RAG。询问博客内容、探索技术文章，或直接预约会议——通过流式 AI 对话界面一键完成。',
    tryAgent: '试试 AI 助手',
    browseBlog: '浏览博客',
    fromBlog: '最新文章',
    recentPosts: '近期博文',
    recentDesc: '关于系统设计、分布式系统与软件工程的技术笔记。',
    viewAll: '查看全部',
    career: '工作经历',
    experience: '经历',
    expDesc: '我的工作历程与主要项目一览。',
    fullExp: '查看完整经历',
    letsTalk: '联系方式',
    connect: '联系我',
    connectDesc: '欢迎新机会、技术交流与合作洽谈。',
    allContact: '所有联系方式',
    footer: '基于 Next.js 构建 ❤️',
    deployed: '部署于 Vercel',
    expEntries: [
      {
        company: 'Madison-Davis',
        role: '软件工程师',
        period: '2024.10 – 至今',
        location: '纽约',
        tags: ['Java', 'Spring Boot', 'Kafka', 'Kubernetes', 'Debezium', '微服务'],
      },
      {
        company: 'Fiserv',
        role: '软件工程师',
        period: '2023.07 – 2024.10',
        location: '新泽西州 Berkeley Heights',
        tags: ['Java', 'JavaEE', 'Redis', 'Kafka', 'Kubernetes', 'Helm'],
      },
      {
        company: '腾讯 Tencent',
        role: '后端开发实习生',
        period: '2020.07 – 2020.10',
        location: '深圳',
        tags: ['Go', 'gRPC', 'Druid', 'AIOps'],
      },
    ],
  },
};

export default function HomeClient({ recentPosts }: Props) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { lang } = useLanguage();
  const t = translations[lang];

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
                href="https://github.com/ChrisZZhong"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 glass-card flex items-center justify-center text-text-muted hover:text-accent-cyan hover:border-accent-cyan/30 transition-all"
              >
                <Github size={16} />
              </a>
              <a
                href="https://www.linkedin.com/in/zhicheng-z-35805722b/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 glass-card flex items-center justify-center text-text-muted hover:text-accent-cyan hover:border-accent-cyan/30 transition-all"
              >
                <Linkedin size={16} />
              </a>
              <a
                href="mailto:zzcjob397@gmail.com"
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
              {t.available}
            </div>

            {/* Name */}
            <h1
              className="text-5xl lg:text-7xl font-black mb-4 leading-tight"
              style={{ animation: 'slide-up 0.6s ease-out 0.2s both' }}
            >
              {lang === 'en' ? (
                <>
                  <span className="text-text-primary">Zhicheng</span>
                  <br />
                  <span className="gradient-text">Zhong</span>
                </>
              ) : (
                <>
                  <span className="text-text-primary">钟</span>
                  <span className="gradient-text">志成</span>
                </>
              )}
            </h1>

            {/* Title */}
            <p
              className="text-xl lg:text-2xl text-text-muted font-medium mb-6"
              style={{ animation: 'slide-up 0.6s ease-out 0.3s both' }}
            >
              {t.title1}
              <span className="text-accent-cyan mx-2">/</span>
              {t.title2}
              <span className="text-accent-cyan mx-2">/</span>
              {t.title3}
            </p>

            {/* Bio */}
            <p
              className="text-text-muted leading-relaxed max-w-xl mb-8 text-base lg:text-lg"
              style={{ animation: 'slide-up 0.6s ease-out 0.4s both' }}
            >
              {t.bio}
            </p>

            {/* Tech stack chips */}
            <div
              className="flex flex-wrap gap-2 mb-10 justify-center lg:justify-start"
              style={{ animation: 'slide-up 0.6s ease-out 0.5s both' }}
            >
              {['Python', 'Java', 'RAG / LLM', 'Kafka', 'Spring Boot', 'Kubernetes', 'AWS'].map((tech) => (
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
                {t.readBlog} <ChevronRight size={16} />
              </Link>
              <Link
                href="/connect"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-card-border text-text-muted font-semibold text-sm hover:border-accent-purple/30 hover:text-text-primary transition-all duration-200"
              >
                {t.getInTouch} <ExternalLink size={14} />
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

      {/* ─── AI AGENT CTA ──────────────────────────────────────────── */}
      <section className="py-16 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="relative glass-card rounded-2xl overflow-hidden p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/5 via-transparent to-accent-cyan/5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl pointer-events-none" />

            {/* Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 border border-accent-purple/30 flex items-center justify-center">
                <Bot size={36} className="text-accent-purple" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-space flex items-center justify-center">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-ping absolute" />
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full" />
              </div>
            </div>

            {/* Text */}
            <div className="relative flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-purple/30 bg-accent-purple/5 text-accent-purple text-xs font-mono font-medium mb-3 tracking-widest">
                <Sparkles size={10} />
                {t.agentBadge}
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-text-primary mb-3">
                {t.agentTitle}
              </h2>
              <p className="text-text-muted text-sm leading-relaxed max-w-lg mb-6">
                {t.agentDesc}
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link
                  href="/agent"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple/20 to-accent-cyan/20 border border-accent-purple/40 text-accent-purple font-semibold text-sm hover:from-accent-purple/30 hover:to-accent-cyan/30 hover:border-accent-purple/60 transition-all duration-200"
                >
                  <Bot size={15} />
                  {t.tryAgent}
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-card-border text-text-muted font-semibold text-sm hover:border-accent-cyan/30 hover:text-text-primary transition-all duration-200"
                >
                  {t.browseBlog} <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BLOG PREVIEW ──────────────────────────────────────────── */}
      <section className="py-24 px-6 relative" id="blog">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label={t.fromBlog}
            title={t.recentPosts}
            subtitle={t.recentDesc}
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
              {t.viewAll} <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── EXPERIENCE PREVIEW ────────────────────────────────────── */}
      <section className="py-24 px-6 relative" id="experience">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label={t.career}
            title={t.experience}
            subtitle={t.expDesc}
          />

          <div className="mt-12 grid md:grid-cols-2 gap-5">
            {t.expEntries.map((exp) => (
              <div key={exp.company} className="glass-card p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-text-primary">{exp.company}</h3>
                    <p className="text-accent-cyan text-sm">{exp.role}</p>
                    <p className="text-text-muted text-xs mt-0.5">{exp.location}</p>
                  </div>
                  <span className="text-xs text-text-muted font-mono whitespace-nowrap ml-2">{exp.period}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {exp.tags.map((t) => (
                    <span key={t} className="tag-badge">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/experience"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-card-border text-text-muted text-sm font-medium hover:border-accent-cyan/30 hover:text-accent-cyan transition-all"
            >
              {t.fullExp} <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CONNECT PREVIEW ───────────────────────────────────────── */}
      <section className="py-24 px-6 relative" id="connect">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label={t.letsTalk}
            title={t.connect}
            subtitle={t.connectDesc}
          />

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {[
              { icon: Mail, label: 'Email', href: 'mailto:zzcjob397@gmail.com', value: 'zzcjob397@gmail.com' },
              { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/zhicheng-z-35805722b/', value: 'linkedin.com/in/zhicheng-z' },
              { icon: Github, label: 'GitHub', href: 'https://github.com/ChrisZZhong', value: 'github.com/ChrisZZhong' },
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
              {t.allContact} <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-card-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} Zhicheng Zhong. {t.footer}
          </p>
          <p className="text-text-muted text-xs font-mono">
            {t.deployed}
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
