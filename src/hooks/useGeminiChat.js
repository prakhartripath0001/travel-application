import { useCallback, useEffect, useRef, useState } from 'react';
import { createDestinationChat, isGeminiConfigured, parseGeminiError, sendChatMessage } from '../services/gemini.js';

let nextId = 1;

function createMessage(role, text) {
  return { id: nextId++, role, text, timestamp: Date.now() };
}

export function useGeminiChat(destination) {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle');
  const chatRef = useRef(null);
  const destinationIdRef = useRef(null);

  // Reset chat when destination changes
  useEffect(() => {
    if (!destination || destination.id === destinationIdRef.current) {
      return;
    }

    destinationIdRef.current = destination.id;

    if (!isGeminiConfigured()) {
      setMessages([
        createMessage(
          'assistant',
          `I'd love to help you plan your trip to ${destination.name}, but the Gemini API key is not configured yet. Please add your GEMINI_API_KEY to the .env file and restart the dev server.`,
        ),
      ]);
      setStatus('error');
      return;
    }

    chatRef.current = createDestinationChat(destination);

    setMessages([
      createMessage(
        'assistant',
        `Welcome! I'm your travel concierge for ${destination.name}, ${destination.country}. I can help you plan your visit — ask me about the best places to see, how many days to spend, the ideal time to visit, or anything else about this destination.`,
      ),
    ]);
    setStatus('idle');
  }, [destination]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || status === 'sending') {
        return;
      }

      const userMessage = createMessage('user', trimmed);
      setMessages((prev) => [...prev, userMessage]);
      setStatus('sending');

      try {
        const reply = await sendChatMessage(chatRef.current, trimmed);
        const assistantMessage = createMessage('assistant', reply);
        setMessages((prev) => [...prev, assistantMessage]);
        setStatus('idle');
      } catch (error) {
        const parsed = parseGeminiError(error);
        const errorText = parsed.isHighDemand
          ? 'The AI model is currently experiencing temporary high demand (503). Please wait a few seconds and send your question again.'
          : parsed.isRateLimited
          ? 'Request rate limit reached. Please wait a moment before sending another message.'
          : 'Sorry, I ran into an issue processing your request. Please try again in a moment.';

        const errorMessage = createMessage('assistant', errorText);
        setMessages((prev) => [...prev, errorMessage]);
        setStatus('error');

        // Reset status after a short delay so user can retry
        setTimeout(() => setStatus('idle'), 1500);
      }
    },
    [status],
  );

  const resetChat = useCallback(() => {
    if (!destination) {
      return;
    }

    destinationIdRef.current = null;

    // Force re-initialization by clearing ref and triggering effect
    chatRef.current = null;
    destinationIdRef.current = destination.id;

    if (isGeminiConfigured()) {
      chatRef.current = createDestinationChat(destination);
      setMessages([
        createMessage(
          'assistant',
          `Chat reset! I'm ready to help you plan your trip to ${destination.name}. What would you like to know?`,
        ),
      ]);
    }

    setStatus('idle');
  }, [destination]);

  return { messages, status, sendMessage, resetChat };
}
