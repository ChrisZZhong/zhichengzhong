import { Bot, Sparkles, Search, Calendar } from 'lucide-react';
import AgentChat from '@/components/AgentChat';

export const metadata = {
  title: 'AI Agent | Zhicheng Zhong',
  description:
    'Chat with an AI assistant that can search through my blog posts and help schedule a meeting.',
};

export default function AgentPage() {
  return (
    <main className="min-h-screen bg-grid flex flex-col">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-1 opacity-30" />
        <div className="orb orb-3 opacity-20" />
      </div>

      <div className="relative z-10 flex flex-col flex-1 max-w-4xl mx-auto w-full px-4 pt-24 pb-6" style={{ minHeight: '100vh' }}>

        {/* ── Header ── */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent-cyan/20 bg-accent-cyan/5 text-accent-cyan text-xs font-mono font-medium mb-4 tracking-widest">
            <span className="w-1.5 h-1.5 bg-accent-cyan rounded-full animate-pulse" />
            AI ASSISTANT
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-text-primary mb-3">
            Chat with My{' '}
            <span className="gradient-text">AI Agent</span>
          </h1>
          <p className="text-text-muted text-sm max-w-lg mx-auto leading-relaxed">
            Powered by Gemini 2.5 Flash + LangChain. Ask about anything on my blog,
            or schedule a meeting directly through the calendar tool.
          </p>

          {/* Capability chips */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-card-border text-xs text-text-muted">
              <Search size={12} className="text-accent-cyan" />
              Semantic blog search via RAG
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-card-border text-xs text-text-muted">
              <Calendar size={12} className="text-accent-cyan" />
              Google Calendar meeting scheduling
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-card-border text-xs text-text-muted">
              <Sparkles size={12} className="text-accent-purple" />
              Streaming responses
            </div>
          </div>
        </div>

        {/* ── Chat window ── */}
        <div
          className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col"
          style={{ minHeight: 0, height: 'calc(100vh - 320px)', maxHeight: '680px' }}
        >
          <AgentChat />
        </div>

        {/* ── Footer note ── */}
        <p className="text-center text-xs text-text-muted/40 font-mono mt-4">
          Responses may be inaccurate. Always verify important information.
        </p>
      </div>
    </main>
  );
}
