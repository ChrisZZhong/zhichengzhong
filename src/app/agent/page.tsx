import AgentChat from '@/components/AgentChat';
import { AgentHeader, AgentFooter } from '@/components/AgentHeader';

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

      <div
        className="relative z-10 flex flex-col max-w-4xl mx-auto w-full px-4"
        style={{ height: '100dvh', paddingTop: '80px', paddingBottom: '12px' }}
      >
        <AgentHeader />

        {/* ── Chat window ── */}
        <div className="flex-1 min-h-0 glass-card rounded-2xl overflow-hidden flex flex-col">
          <AgentChat />
        </div>

        <AgentFooter />
      </div>
    </main>
  );
}
