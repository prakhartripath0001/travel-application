import { GoogleGenAI } from '@google/genai';

const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

let ai = null;

function getClient() {
  if (!geminiKey) {
    return null;
  }

  if (!ai) {
    ai = new GoogleGenAI({ apiKey: geminiKey });
  }

  return ai;
}

function buildSystemInstruction(destination) {
  const places = destination.famousPlaces
    .map((place) => `- ${place.name} (${place.area}): ${place.description}`)
    .join('\n');

  const highlights = destination.highlights?.join(', ') || '';
  const thingsToDo = destination.thingsToDo?.join(', ') || '';
  const practicalInfo = destination.practicalInfo?.join('. ') || '';

  return `You are a knowledgeable and friendly travel concierge for ${destination.name}, ${destination.country}.

DESTINATION CONTEXT:
- Name: ${destination.name}
- Country: ${destination.country}
- Region: ${destination.region || 'N/A'}
- Category: ${destination.category || 'N/A'}
- Best for: ${destination.bestFor}
- Description: ${destination.description}
- Overview: ${destination.overview || ''}
- Details: ${destination.details || ''}
- Best time to visit: ${destination.bestTime || 'Not specified'}
- Highlights: ${highlights}
- Things to do: ${thingsToDo}
- Practical info: ${practicalInfo}

FAMOUS PLACES:
${places}

INSTRUCTIONS:
- Answer questions about ${destination.name} using the context above.
- Be concise and practical. Keep answers focused and useful for travelers.
- Suggest itineraries, timing, places, and practical tips when asked.
- If you do not have specific information, say so honestly rather than inventing facts.
- If a question is unrelated to travel or ${destination.name}, politely redirect the visitor back to trip planning.
- Use a warm, helpful tone. You are a travel concierge, not a generic chatbot.
- Format responses with short paragraphs. Use bullet points for lists.
- Do not use markdown headers. Keep formatting simple and readable.`;
}

export function createDestinationChat(destination) {
  const client = getClient();

  if (!client) {
    return null;
  }

  const chat = client.chats.create({
    model: 'gemini-2.0-flash',
    config: {
      systemInstruction: buildSystemInstruction(destination),
    },
  });

  return chat;
}

export async function sendChatMessage(chat, message) {
  if (!chat) {
    throw new Error('Chat session is not initialized. Please add a Gemini API key.');
  }

  const response = await chat.sendMessage({ message });
  return response.text;
}

export function isGeminiConfigured() {
  return Boolean(geminiKey);
}
