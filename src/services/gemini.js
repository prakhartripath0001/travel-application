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

export async function generateItinerary(destination, days = 3, preferences = '') {
  const client = getClient();
  if (!client) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const famousPlacesText = destination.famousPlaces
    ? destination.famousPlaces.map((p) => `${p.name} (${p.area})`).join(', ')
    : '';

  const prompt = `Generate a comprehensive, realistic ${days}-day travel itinerary for ${destination.name}, ${destination.country}.

Destination Information:
- Description: ${destination.description || ''}
- Highlights: ${(destination.highlights || []).join(', ')}
- Known Famous Places: ${famousPlacesText}
- Best for: ${destination.bestFor || ''}
- General tips/Practical info: ${(destination.practicalInfo || []).join('. ')}
${preferences ? `- Traveler's specific preferences / interests: "${preferences}"` : ''}

You MUST return a single valid JSON object adhering EXACTLY to this schema:
{
  "destination": "${destination.name}",
  "duration": ${days},
  "overview": "Short 1-2 sentence inspiring overview of this custom trip",
  "days": [
    {
      "day": 1,
      "title": "Day theme or title",
      "morning": [
        {
          "activity": "Activity name",
          "place": "Place or landmark name",
          "description": "Engaging 1-2 sentence description of what to do"
        }
      ],
      "afternoon": [
        {
          "activity": "Activity name",
          "place": "Place or landmark name",
          "description": "Engaging 1-2 sentence description of what to do"
        }
      ],
      "evening": [
        {
          "activity": "Activity name",
          "place": "Place or landmark name",
          "description": "Engaging 1-2 sentence description of what to do"
        }
      ],
      "tips": "Practical tip for this specific day"
    }
  ]
}

Ensure there are exactly ${days} days in the days array, numbered 1 to ${days}. Incorporate the famous places where appropriate, and tailor activities to the traveler's preferences. Return pure JSON only.`;

  const response = await client.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const rawText = response.text;
  if (!rawText) {
    throw new Error('No response received from Gemini.');
  }

  // Clean and parse JSON safely
  let parsed;
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse itinerary JSON:', rawText);
    throw new Error('Received an invalid or malformed itinerary format from Gemini.');
  }

  // Validate schema
  if (!parsed || !Array.isArray(parsed.days) || parsed.days.length === 0) {
    throw new Error('Itinerary structure is incomplete or missing required day details.');
  }

  // Normalize each day
  parsed.days = parsed.days.map((dayItem, index) => ({
    day: dayItem.day || index + 1,
    title: dayItem.title || `Day ${index + 1}`,
    morning: Array.isArray(dayItem.morning) ? dayItem.morning : [],
    afternoon: Array.isArray(dayItem.afternoon) ? dayItem.afternoon : [],
    evening: Array.isArray(dayItem.evening) ? dayItem.evening : [],
    tips: dayItem.tips || '',
  }));

  return parsed;
}
