'use client';

import { Search, Calendar, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const tx = {
  en: {
    badge: 'AI ASSISTANT',
    title: 'Chat with My',
    titleGradient: 'AI Agent',
    desc: 'Powered by Gemini 2.5 Flash + LangChain. Ask about anything on my blog, or schedule a meeting directly through the calendar tool.',
    chip1: 'Semantic blog search via RAG',
    chip2: 'Google Calendar meeting scheduling',
    chip3: 'Streaming responses',
    footer: 'Responses may be inaccurate. Always verify important information.',
  },
  zh: {
    badge: 'AI 助手',
    title: '与我的',
    titleGradient: 'AI 助手对话',
    desc: '基于 Gemini 2.5 Flash + LangChain。询问博客内容或直接通过日历工具预约会议。',
    chip1: 'RAG 语义博客搜索',
    chip2: 'Google 日历会议预约',
    chip3: '流式实时回复',
    footer: '回复内容仅供参考，重要信息请自行核实。',
  },
};

export function AgentHeader() {
  const { lang } = useLanguage();
  const t = tx[lang];

  return (
    <div className="mb-4 text-center shrink-0">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent-cyan/20 bg-accent-cyan/5 text-accent-cyan text-xs font-mono font-medium mb-3 tracking-widest">
        <span className="w-1.5 h-1.5 bg-accent-cyan rounded-full animate-pulse" />
        {t.badge}
      </div>
      <h1 className="text-2xl lg:text-4xl font-black text-text-primary mb-2">
        {t.title}{' '}
        <span className="gradient-text">{t.titleGradient}</span>
      </h1>
      <p className="text-text-muted text-xs lg:text-sm max-w-lg mx-auto leading-relaxed hidden sm:block">
        {t.desc}
      </p>
      <div className="hidden sm:flex flex-wrap justify-center gap-3 mt-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-card-border text-xs text-text-muted">
          <Search size={12} className="text-accent-cyan" />
          {t.chip1}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-card-border text-xs text-text-muted">
          <Calendar size={12} className="text-accent-cyan" />
          {t.chip2}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-card-border text-xs text-text-muted">
          <Sparkles size={12} className="text-accent-purple" />
          {t.chip3}
        </div>
      </div>
    </div>
  );
}

export function AgentFooter() {
  const { lang } = useLanguage();
  return (
    <p className="text-center text-xs text-text-muted/40 font-mono mt-2 shrink-0 hidden sm:block">
      {tx[lang].footer}
    </p>
  );
}
