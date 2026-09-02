import { Bot, CornerDownLeft, RotateCcw, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useGeminiChat } from '../hooks/useGeminiChat.js';

const suggestedQuestions = [
  'How many days should I spend here?',
  'What are the must-see places?',
  'When is the best time to visit?',
  'What should I do for 3 days?',
  'Is this good for a family trip?',
];

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
        aria-hidden="true"
      >
        <Bot size={16} />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-stone-100 px-4 py-3 dark:bg-neutral-800">
        <div className="flex items-center gap-1.5" aria-label="Assistant is typing">
          <span className="typing-dot h-2 w-2 rounded-full bg-stone-400 dark:bg-stone-500" />
          <span className="typing-dot animation-delay-150 h-2 w-2 rounded-full bg-stone-400 dark:bg-stone-500" />
          <span className="typing-dot animation-delay-300 h-2 w-2 rounded-full bg-stone-400 dark:bg-stone-500" />
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-emerald-800 px-4 py-3 text-sm leading-relaxed text-white dark:bg-emerald-700">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
        aria-hidden="true"
      >
        <Bot size={16} />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-stone-100 px-4 py-3 text-sm leading-relaxed text-stone-800 dark:bg-neutral-800 dark:text-stone-200">
        {message.text.split('\n').map((line, index) => (
          <span key={index}>
            {line}
            {index < message.text.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ChatBot({ destination }) {
  const { messages, status, sendMessage, resetChat } = useGeminiChat(destination);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const isSending = status === 'sending';
  const showSuggestions = messages.length <= 1;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  function handleSubmit(event) {
    event.preventDefault();

    if (!input.trim() || isSending) {
      return;
    }

    sendMessage(input);
    setInput('');
    inputRef.current?.focus();
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  }

  function handleSuggestionClick(question) {
    if (isSending) {
      return;
    }

    sendMessage(question);
    inputRef.current?.focus();
  }

  return (
    <article className="flex h-[32rem] flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3.5 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
            <Bot size={17} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-950 dark:text-white">AI Travel Concierge</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">{destination.name}, {destination.country}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={resetChat}
          className="rounded-md p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-neutral-800 dark:hover:text-stone-300"
          aria-label="Reset conversation"
          title="Reset conversation"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 space-y-4 overflow-y-auto px-5 py-4"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isSending && <TypingIndicator />}

        {/* Suggested questions */}
        {showSuggestions && !isSending && (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-medium text-stone-400 dark:text-stone-500">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleSuggestionClick(question)}
                  className="rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-stone-300 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-stone-200 px-4 py-3 dark:border-neutral-800"
      >
        <label className="sr-only" htmlFor="chat-input">
          Ask about {destination.name}
        </label>
        <textarea
          ref={inputRef}
          id="chat-input"
          className="max-h-28 min-h-[2.5rem] flex-1 resize-none rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-950 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-stone-500 dark:focus:border-emerald-500"
          placeholder={`Ask about ${destination.name}...`}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isSending}
          aria-label={`Ask about ${destination.name}`}
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-800 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          aria-label="Send message"
        >
          {isSending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>

      {/* Keyboard hint */}
      <div className="flex items-center gap-1 border-t border-stone-100 px-4 py-1.5 text-[10px] text-stone-400 dark:border-neutral-800/50 dark:text-stone-600">
        <CornerDownLeft size={10} aria-hidden="true" />
        <span>Enter to send · Shift + Enter for new line</span>
      </div>
    </article>
  );
}
