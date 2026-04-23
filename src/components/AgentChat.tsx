'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, Square, Search, Calendar, Cpu, ChevronDown, ChevronUp, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_URL } from '@/lib/config';

/* ── Types ──────────────────────────────────────────────────────────────── */

type Role = 'human' | 'assistant';

interface Message {
  id: string;
  role: Role;
  content: string;
  toolEvents?: ToolEvent[];
  isStreaming?: boolean;
}

interface ToolEvent {
  type: 'start' | 'end';
  name: string;
  input?: string;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function uid() {
  return Math.random().toString(36).slice(2);
}

function ToolBadge({ events }: { events: ToolEvent[] }) {
  const [open, setOpen] = useState(false);
  if (!events.length) return null;

  const uniqueTools = Array.from(new Set(events.filter(e => e.type === 'start').map(e => e.name)));

  return (
    <div className="mt-2 text-xs">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-accent-cyan/70 hover:text-accent-cyan transition-colors font-mono"
      >
        <Cpu size={11} />
        <span>Used: {uniqueTools.join(', ')}</span>
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>
      {open && (
        <div className="mt-2 space-y-1 border-l border-accent-cyan/20 pl-3">
          {events.filter(e => e.type === 'start').map((e, i) => (
            <div key={i} className="text-text-muted">
              <span className="text-accent-purple">→ {e.name}</span>
              {e.input && (
                <span className="text-text-muted/60 ml-1 truncate">
                  ({e.input.slice(0, 80)}{e.input.length > 80 ? '…' : ''})
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isHuman = msg.role === 'human';

  return (
    <div className={`flex ${isHuman ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isHuman && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/30 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
          <Bot size={14} className="text-accent-cyan" />
        </div>
      )}

      <div className={`max-w-[80%] ${isHuman ? 'order-1' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isHuman
              ? 'bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/30 text-text-primary rounded-tr-sm'
              : 'glass-card text-text-primary rounded-tl-sm'
          }`}
        >
          {isHuman ? (
            <span className="whitespace-pre-wrap">{msg.content}</span>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                li: ({ children }) => <li className="text-text-primary">{children}</li>,
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-');
                  return isBlock ? (
                    <code className="block bg-black/30 rounded-lg px-3 py-2 my-2 font-mono text-xs text-accent-cyan overflow-x-auto whitespace-pre">{children}</code>
                  ) : (
                    <code className="bg-black/30 rounded px-1.5 py-0.5 font-mono text-xs text-accent-cyan">{children}</code>
                  );
                },
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent-cyan underline underline-offset-2 hover:text-accent-purple transition-colors">{children}</a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-accent-cyan/40 pl-3 my-2 text-text-muted italic">{children}</blockquote>
                ),
                hr: () => <hr className="border-card-border my-3" />,
                h1: ({ children }) => <h1 className="font-bold text-base mb-1 text-text-primary">{children}</h1>,
                h2: ({ children }) => <h2 className="font-semibold text-sm mb-1 text-text-primary">{children}</h2>,
                h3: ({ children }) => <h3 className="font-medium text-sm mb-1 text-text-primary">{children}</h3>,
              }}
            >
              {msg.content}
            </ReactMarkdown>
          )}
          {msg.isStreaming && (
            <span className="inline-block w-2 h-4 bg-accent-cyan ml-0.5 align-middle animate-pulse rounded-sm" />
          )}
        </div>

        {!isHuman && msg.toolEvents && msg.toolEvents.length > 0 && (
          <ToolBadge events={msg.toolEvents} />
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/30 flex items-center justify-center flex-shrink-0 mr-3">
        <Bot size={14} className="text-accent-cyan" />
      </div>
      <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-accent-cyan/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-accent-cyan/60 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
        <span className="w-1.5 h-1.5 bg-accent-cyan/60 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────── */

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: 'assistant',
      content:
        "Hi! I'm Zhicheng's AI assistant. I can search his technical blog posts or help you schedule a meeting with him.\n\nWhat would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  // "calendar" toggle controls both calendar_slots and calendar tools together
  const [enabledTools, setEnabledTools] = useState<string[]>(['rag', 'calendar_slots', 'calendar']);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);
  const baseInputRef = useRef(''); // committed text before current voice session

  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'zh-CN' | 'en-US'>('en-US');

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const toggleVoice = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      stopVoice();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    recognition.interimResults = true;
    recognition.continuous = true;     // keep listening until user stops manually
    recognition.maxAlternatives = 1;

    // Save whatever was already typed before voice starts
    baseInputRef.current = input;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (e: any) => {
      let newFinals = '';
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) newFinals += transcript;
        else interim += transcript;
      }
      // Commit new finals into the base
      if (newFinals) baseInputRef.current += newFinals;
      // Show base + current interim in the textarea
      setInput(baseInputRef.current + interim);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      // Ensure input reflects only committed text (no trailing interim)
      setInput(baseInputRef.current);
    };

    recognition.onerror = (e: any) => {
      // 'no-speech' is normal (silence timeout) — just restart quietly
      if (e.error === 'no-speech') return;
      console.error('Speech recognition error:', e.error);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, voiceLang, input, stopVoice]);
  // Token queue for typewriter effect
  const tokenQueueRef = useRef<string[]>([]);
  const drainIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Drain one token from the queue every TOKEN_INTERVAL ms
  const TOKEN_INTERVAL = 30; // ms — adjust for faster/slower typewriter

  const startDrain = useCallback((assistantId: string) => {
    if (drainIntervalRef.current) return; // already running
    drainIntervalRef.current = setInterval(() => {
      const token = tokenQueueRef.current.shift();
      if (token === undefined) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: m.content + token } : m
        )
      );
    }, TOKEN_INTERVAL);
  }, []);

  const stopDrain = useCallback(() => {
    if (drainIntervalRef.current) {
      clearInterval(drainIntervalRef.current);
      drainIntervalRef.current = null;
    }
    tokenQueueRef.current = [];
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  const toggleTool = (key: string) => {
    // "calendar" toggle controls both calendar_slots + calendar together
    const linked: Record<string, string[]> = {
      calendar: ['calendar_slots', 'calendar'],
    };
    const targets = linked[key] ?? [key];
    const allActive = targets.every((t) => enabledTools.includes(t));
    setEnabledTools((prev) =>
      allActive
        ? prev.filter((t) => !targets.includes(t))
        : Array.from(new Set([...prev, ...targets]))
    );
  };

  const isToolActive = (key: string) => {
    const linked: Record<string, string[]> = {
      calendar: ['calendar_slots', 'calendar'],
    };
    const targets = linked[key] ?? [key];
    return targets.some((t) => enabledTools.includes(t));
  };

  const stop = useCallback(() => {
    abortRef.current?.abort();
    stopDrain();
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1 ? { ...m, isStreaming: false } : m
      )
    );
  }, [stopDrain]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const humanMsg: Message = { id: uid(), role: 'human', content: text };
    const assistantId = uid();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      toolEvents: [],
      isStreaming: true,
    };

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    stopVoice();
    setMessages((prev) => [...prev, humanMsg, assistantMsg]);
    setInput('');
    baseInputRef.current = '';
    setIsStreaming(true);
    tokenQueueRef.current = [];

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: 'web',
          enabled_tools: enabledTools,
          history,
        }),
        signal: ctrl.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(line.slice(6));

            if (payload.type === 'token') {
              // Push each character individually so the interval drains at
              // a steady per-character pace regardless of chunk size
              for (const char of payload.content as string) {
                tokenQueueRef.current.push(char);
              }
              startDrain(assistantId);
            } else if (payload.type === 'tool_start') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        toolEvents: [
                          ...(m.toolEvents ?? []),
                          { type: 'start', name: payload.name, input: payload.input },
                        ],
                      }
                    : m
                )
              );
            } else if (payload.type === 'tool_end') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        toolEvents: [
                          ...(m.toolEvents ?? []),
                          { type: 'end', name: payload.name },
                        ],
                      }
                    : m
                )
              );
            } else if (payload.type === 'done') {
              // Wait for the queue to drain before marking complete
              const waitForDrain = () => {
                if (tokenQueueRef.current.length === 0) {
                  stopDrain();
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, isStreaming: false } : m
                    )
                  );
                  setIsStreaming(false);
                } else {
                  setTimeout(waitForDrain, TOKEN_INTERVAL * 2);
                }
              };
              waitForDrain();
            } else if (payload.type === 'error') {
              stopDrain();
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: m.content + `\n\n⚠️ ${payload.content}`,
                        isStreaming: false,
                      }
                    : m
                )
              );
              setIsStreaming(false);
            }
          } catch {
            // ignore JSON parse errors on partial chunks
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      stopDrain();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  m.content ||
                  '⚠️ Could not reach the backend. Make sure the API server is running.',
                isStreaming: false,
              }
            : m
        )
      );
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages, enabledTools, startDrain, stopDrain, stopVoice]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const showTyping = isStreaming && messages[messages.length - 1]?.content === '';

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Tool toggles ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-card-border">
        <span className="text-xs text-text-muted font-mono tracking-widest">TOOLS</span>
        <ToolToggle
          active={isToolActive('rag')}
          icon={<Search size={12} />}
          label="Blog Search"
          onClick={() => toggleTool('rag')}
        />
        <ToolToggle
          active={isToolActive('calendar')}
          icon={<Calendar size={12} />}
          label="Schedule Meeting"
          onClick={() => toggleTool('calendar')}
        />
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 min-h-0">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {showTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div className="px-4 py-3 border-t border-card-border">
        <div className="flex items-end gap-2 glass-card px-4 py-2 rounded-2xl">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about blog posts or schedule a meeting…"
            disabled={isStreaming}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted resize-none outline-none py-1.5 leading-relaxed min-h-0"
          />

          {/* Mic button + language toggle */}
          {!isStreaming && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* zh / en toggle — only show when not listening */}
              {!isListening && (
                <button
                  onClick={() => setVoiceLang((l) => l === 'zh-CN' ? 'en-US' : 'zh-CN')}
                  className="text-[10px] font-mono font-semibold text-text-muted/50 hover:text-accent-cyan transition-colors w-7 text-center"
                  title="Switch language"
                >
                  {voiceLang === 'zh-CN' ? '中' : 'EN'}
                </button>
              )}
              <button
                onClick={toggleVoice}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse'
                    : 'bg-accent-purple/10 border border-accent-purple/30 text-accent-purple hover:bg-accent-purple/20'
                }`}
                aria-label={isListening ? 'Stop recording' : 'Voice input'}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            </div>
          )}

          {/* Send / Stop */}
          {isStreaming ? (
            <button
              onClick={stop}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all"
              aria-label="Stop"
            >
              <Square size={14} />
            </button>
          ) : (
            <button
              onClick={send}
              disabled={!input.trim()}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan flex items-center justify-center hover:bg-accent-cyan/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Send"
            >
              <Send size={14} />
            </button>
          )}
        </div>
        <p className="text-center text-xs text-text-muted/40 mt-2 font-mono">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

/* ── ToolToggle ─────────────────────────────────────────────────────────── */

function ToolToggle({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
        active
          ? 'bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan'
          : 'bg-transparent border-card-border text-text-muted hover:border-accent-cyan/20 hover:text-text-primary'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
