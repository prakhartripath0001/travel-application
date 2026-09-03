import { GoogleGenAI } from '@google/genai';

const geminiKey =
  (typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY
    : typeof process !== 'undefined'
    ? process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
    : '') || '';

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

const CANDIDATE_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function parseGeminiError(error) {
  if (!error) {
    return {
      statusCode: 500,
      isHighDemand: false,
      isRateLimited: false,
      isAuthError: false,
      isRetryable: false,
      message: 'An unexpected error occurred. Please try again.',
      raw: '',
    };
  }

  let statusCode = error.status || error.code || null;
  let rawMessage = error.message || String(error);
  let statusText = error.error?.status || null;

  // Handle case where error.message is a JSON string (e.g. {"error":{"code":503,"message":"..."}})
  if (typeof rawMessage === 'string') {
    const trimmed = rawMessage.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.error) {
          statusCode = parsed.error.code || statusCode;
          rawMessage = parsed.error.message || rawMessage;
          statusText = parsed.error.status || statusText;
        }
      } catch {
        // Not JSON
      }
    }
  }

  const isHighDemand =
    statusCode === 503 ||
    statusText === 'UNAVAILABLE' ||
    /503|high demand|temporarily unavailable|spikes in demand|service unavailable/i.test(rawMessage);

  const isRateLimited =
    statusCode === 429 ||
    statusText === 'RESOURCE_EXHAUSTED' ||
    /429|quota|rate limit|too many requests|resource exhausted/i.test(rawMessage);

  const isAuthError =
    statusCode === 401 ||
    statusCode === 403 ||
    statusText === 'PERMISSION_DENIED' ||
    statusText === 'UNAUTHENTICATED' ||
    /api key|unauthorized|permission denied|credentials/i.test(rawMessage);

  const isNetworkError =
    /failed to fetch|network error|econnreset|econnrefused|etimedout|abort|timeout/i.test(rawMessage);

  let friendlyMessage;
  let isRetryable = false;

  if (isHighDemand) {
    isRetryable = true;
    friendlyMessage =
      'The Gemini model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again in a few moments.';
  } else if (isRateLimited) {
    isRetryable = true;
    friendlyMessage =
      'Rate limit or request quota reached. Please wait a short moment and try again.';
  } else if (isAuthError) {
    isRetryable = false;
    friendlyMessage =
      'Gemini API key is invalid or unauthorized. Please verify your GEMINI_API_KEY in the .env file.';
  } else if (isNetworkError) {
    isRetryable = true;
    friendlyMessage =
      'Unable to connect to Gemini API. Please check your internet connection and try again.';
  } else {
    friendlyMessage = rawMessage || 'Failed to communicate with the AI service. Please try again.';
  }

  return {
    statusCode: statusCode ? Number(statusCode) : isHighDemand ? 503 : isRateLimited ? 429 : 500,
    isHighDemand,
    isRateLimited,
    isAuthError,
    isRetryable,
    message: friendlyMessage,
    raw: rawMessage,
  };
}

function buildSystemInstruction(destination) {
  const places = (destination.famousPlaces || [])
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
    model: 'gemini-3.6-flash',
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

  // Attempt with retry if temporary 503 high demand occurs
  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await chat.sendMessage({ message });
      return response.text;
    } catch (err) {
      const parsed = parseGeminiError(err);
      if (parsed.isRetryable && attempt < maxRetries) {
        const delay = 1000 * (attempt + 1) + Math.random() * 500;
        await wait(delay);
        continue;
      }
      throw err;
    }
  }
}

export function isGeminiConfigured() {
  return Boolean(geminiKey);
}

export function generateCuratedFallbackItinerary(destination, days = 3, preferences = '') {
  const famousPlaces = destination.famousPlaces || [];
  const thingsToDo = destination.thingsToDo || [];
  const highlights = destination.highlights || [];
  const practicalInfo = destination.practicalInfo || [];

  const dayTitles = [
    `Arrival & Iconic Landmarks of ${destination.name}`,
    `Culture, Architecture & Historic Quarters`,
    `Scenic Panoramas & Local Atmosphere`,
    `Neighborhood Walks & Culinary Discoveries`,
    `Artistic Heritage & Leisurely Exploration`,
    `Deep Dive & Hidden Gems`,
    `Day Excursion & Local Retreats`,
    `Special Interests & City Vistas`,
    `Markets, Craft & Modern Vibe`,
    `Farewell & Unmissable Highlights`,
  ];

  const generatedDays = [];

  for (let i = 0; i < days; i++) {
    const dayNumber = i + 1;
    const title = dayTitles[i] || `Day ${dayNumber}: Discovering ${destination.name}`;

    // Rotate famous places
    const place1 = famousPlaces[i % Math.max(1, famousPlaces.length)] || {
      name: `${destination.name} City Center`,
      area: 'Central District',
      description: `Explore the vibrant heart of ${destination.name}.`,
    };

    const place2 = famousPlaces[(i + 1) % Math.max(1, famousPlaces.length)] || place1;

    const highlightText = highlights[i % Math.max(1, highlights.length)] || destination.bestFor;
    const todoText = thingsToDo[i % Math.max(1, thingsToDo.length)] || 'Stroll through the scenic pedestrian quarters';
    const tipText = practicalInfo[i % Math.max(1, practicalInfo.length)] || 'Comfortable walking shoes are recommended.';

    const prefNote = preferences ? ` Tailored for your interest in ${preferences}.` : '';

    generatedDays.push({
      day: dayNumber,
      title,
      morning: [
        {
          activity: `Morning Visit to ${place1.name}`,
          place: place1.name,
          description: `${place1.description} Beat the afternoon crowds with an early morning start.${prefNote}`,
        },
      ],
      afternoon: [
        {
          activity: `Afternoon Exploration: ${todoText}`,
          place: place2.name,
          description: `Head towards ${place2.area}. ${place2.description} Take time for local refreshments in the area.`,
        },
      ],
      evening: [
        {
          activity: `Evening Walk & Dining`,
          place: `${place1.area || destination.name}`,
          description: `Experience the evening ambiance. Enjoy dinner highlighting regional specialties inspired by ${highlightText}.`,
        },
      ],
      tips: tipText,
    });
  }

  return {
    destination: destination.name,
    duration: days,
    overview: `A curated ${days}-day guide highlighting the top places, culture, and sights of ${destination.name}.${preferences ? ` Customized around "${preferences}".` : ''}`,
    isCuratedFallback: true,
    days: generatedDays,
  };
}

export async function generateItinerary(destination, days = 3, preferences = '') {
  const client = getClient();
  if (!client) {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.');
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

  let lastError = null;

  // Try across candidate models with retries on transient errors (503 / 429)
  for (let mIndex = 0; mIndex < CANDIDATE_MODELS.length; mIndex++) {
    const model = CANDIDATE_MODELS[mIndex];
    const maxRetries = 1; // 1 retry per model before stepping down to next model

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await client.models.generateContent({
          model,
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
        const cleaned = rawText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();
        const parsed = JSON.parse(cleaned);

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

        parsed.isCuratedFallback = false;
        return parsed;
      } catch (err) {
        lastError = err;
        const parsedErr = parseGeminiError(err);

        // If non-retryable (e.g. invalid API key), abort immediately without waiting
        if (parsedErr.isAuthError) {
          const formattedErr = new Error(parsedErr.message);
          formattedErr.details = parsedErr;
          throw formattedErr;
        }

        // If high demand (503) or rate limit (429), back off before retrying or switching models
        if (parsedErr.isRetryable) {
          if (attempt < maxRetries) {
            await wait(1200 + Math.random() * 400);
            continue;
          } else if (mIndex < CANDIDATE_MODELS.length - 1) {
            console.warn(`Model ${model} unavailable (${parsedErr.statusCode}), falling back to ${CANDIDATE_MODELS[mIndex + 1]}...`);
            await wait(800);
            break; // Break inner loop to try next model
          }
        } else {
          // Syntax / parse errors from the model or unexpected error
          if (attempt < maxRetries) {
            await wait(500);
            continue;
          }
        }
      }
    }
  }

  // If all models and retries failed, parse the final error nicely
  const finalParsed = parseGeminiError(lastError);
  const friendlyError = new Error(finalParsed.message);
  friendlyError.details = finalParsed;
  throw friendlyError;
}
