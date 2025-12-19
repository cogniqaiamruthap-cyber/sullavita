// Cloudflare Worker for Sulla Vita Restaurant Chatbot
// This worker acts as a proxy to the Google Gemini API with business context

export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow POST requests for chat
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Get the API key from environment variables
      const GEMINI_API_KEY = env.GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'API key not configured' 
        }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
        });
      }

      // Parse the incoming request
      const body = await request.json();
      const userMessage = body.message || body.prompt || '';
      const model = body.model || 'gemini-2.5-flash';
      
      if (!userMessage) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'No message provided' 
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
        });
      }

      // System prompt with business information
      const systemPrompt = `You are a friendly and helpful customer service assistant for Sulla Vita, a Mediterranean restaurant in Leavenworth, Washington.

Business Information:
- Name: Sulla Vita
- Location: 931 Front St, Leavenworth, WA 98826, United States
- Phone: +1 509-679-1114
- Email: sullavita931@gmail.com
- Instagram: @sulla_vita
- Website: sullavita.com
- Description: Mediterranean bites, wood-fired pizza, and craft beer in a rustic locale with a patio

Services:
- Dine-in with rustic patio seating (first-come, first-served)
- Takeaway and online ordering
- Walk-in basis (call ahead for parties of 6+)

Key Information:
- We specialize in Mediterranean small plates and wood-fired pizzas
- Premium craft beers on tap (rotating selection)
- Over 700 positive reviews
- Casual, rustic atmosphere
- Pet-friendly patio
- Street parking available nearby

Guidelines:
- Be warm, friendly, and conversational
- Keep responses concise and helpful (2-4 sentences usually)
- Don't use markdown formatting (no asterisks, underscores, etc.)
- Use emojis sparingly and naturally
- For hours, direct to website or phone since they vary
- For reservations, mention walk-in policy
- For catering inquiries, direct to email or phone
- Always be positive about the restaurant and customer experience

Current user question: ${userMessage}`;

      // Construct the Gemini API request
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      
      const geminiRequest = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: systemPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: body.temperature || 0.7,
          topK: body.topK || 40,
          topP: body.topP || 0.95,
          maxOutputTokens: body.maxOutputTokens || 500,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      // Call the Gemini API
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiRequest),
      });

      const geminiData = await geminiResponse.json();

      // Check for errors
      if (!geminiResponse.ok) {
        console.error('Gemini API Error:', geminiData);
        return new Response(JSON.stringify({ 
          success: false,
          error: geminiData.error?.message || 'Failed to get response from Gemini',
          details: geminiData
        }), {
          status: geminiResponse.status,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
        });
      }

      // Extract the response text
      const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I\'m having trouble generating a response. Please call us at +1 509-679-1114 for assistance.';

      // Return the response in the format bot.js expects (using 'reply' not 'response')
      return new Response(JSON.stringify({
        success: true,
        reply: responseText,  // FIXED: Changed from 'response' to 'reply'
        model: model
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });

    } catch (error) {
      console.error('Worker Error:', error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        message: error.message 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }
  },
};