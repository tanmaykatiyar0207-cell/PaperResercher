import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, HelpCircle, RotateCcw } from 'lucide-react';

interface Message {
  role: 'agent' | 'user';
  text: string;
  isError?: boolean;
  retryQuestion?: string;
}

interface PaperQnADrawerProps {
  isOpen: boolean;
  onClose: () => void;
  paperTitle: string;
  paperSummary: string;
}

export const PaperQnADrawer: React.FC<PaperQnADrawerProps> = ({
  isOpen,
  onClose,
  paperTitle,
  paperSummary,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'agent',
      text: `Hello! I'm your CS Research Assistant for "${paperTitle}". Ask me any technical questions about the architecture, mathematical formulations, hardware scan algorithms, or how to implement components for your project!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  const cleanErrorMessage = (raw: string): string => {
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.error?.message) return parsed.error.message;
      if (parsed?.message) return parsed.message;
    } catch {
      // not json
    }
    if (raw.includes('503') || raw.includes('high demand') || raw.includes('UNAVAILABLE')) {
      return 'The AI model is experiencing a temporary spike in global demand. Please click "Retry" below.';
    }
    return raw;
  };

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ask-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperTitle,
          paperSummary,
          question: textToSend,
          history: messages.filter((m) => !m.isError).slice(-4),
        }),
      });
      const data = await res.json();
      if (data.success && data.answer) {
        setMessages((prev) => [...prev, { role: 'agent', text: data.answer }]);
      } else {
        const errorText = cleanErrorMessage(data.error || 'Failed to retrieve answer. Please try again.');
        setMessages((prev) => [
          ...prev,
          {
            role: 'agent',
            text: errorText,
            isError: true,
            retryQuestion: textToSend,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          text: 'Network error communicating with the research agent server. Please try again.',
          isError: true,
          retryQuestion: textToSend,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'How does this architecture handle hardware memory bandwidth?',
    'What is the computational complexity of the core layer?',
    'How do I test this on a free Google Colab T4 GPU?',
    'Explain the mathematical intuition behind the key formula.',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-slide-left">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">CS Research Advisor</h3>
            <p className="text-xs text-slate-400 truncate max-w-[280px]">{paperTitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Questions */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800/80">
        <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400 mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
          <span>Quick CS Questions:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 hover:text-blue-300 text-slate-300 rounded-md transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start space-x-2.5 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div
              className={`p-1.5 rounded-full flex-shrink-0 ${
                m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div
              className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : m.isError
                  ? 'bg-red-950/50 text-rose-200 border border-red-800/80 rounded-tl-none shadow-sm'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none shadow-sm font-sans'
              }`}
            >
              <div>{m.text}</div>
              {m.isError && m.retryQuestion && (
                <button
                  onClick={() => handleSend(m.retryQuestion)}
                  disabled={loading}
                  className="mt-2.5 flex items-center space-x-1.5 px-2.5 py-1 bg-red-900/60 hover:bg-red-800 text-white text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry Question</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Analyzing research paper context...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about layers, equations, or tech stacks..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
