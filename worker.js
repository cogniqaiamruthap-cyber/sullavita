// Universal Cloudflare Worker for Multiple Business Chatbots
// Supports unlimited businesses - just add their config!

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
      let userMessage = body.message || body.prompt || '';
      const businessId = body.business || body.businessId || 'default';
      const model = body.model || 'gemma-3-4b-it';
      
      // Extract only the actual customer message (remove system prompt if present)
      if (userMessage.includes('Customer:')) {
        const parts = userMessage.split('Customer:');
        userMessage = parts[parts.length - 1].trim();
      }
      
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

      // Business configurations - Add new businesses here!
      const businessConfigs = {
        'sacred-keepsakes': {
          name: 'Sacred Keepsakes',
          systemPrompt: `You are an intelligent English-speaking customer support assistant for "Sacred Keepsakes".

Business Information:
- Business Name: Sacred Keepsakes
- Website: https://www.sacredkeepsakes.co.uk/
- Email: help@sacredkeepsakes.co.uk
- Address: 183 Wigan Lower Road, Wigan, WN6 8LD
- What we do: We create personalised engraved memorial keepsakes including jewellery, boxes, garden keepsakes, and grave keepsakes to honor loved ones.
- Tagline: "Treasured memories, beautifully kept."

Products & Services:
- Personalised memorial jewellery (necklaces, bracelets, keyrings)
- Engraved memorial boxes
- Garden memorial keepsakes
- Grave keepsakes and plaques
- Custom engraving services
- Photo engraving options
- Text and name personalisation

Common Customer Questions:
- What types of memorial keepsakes do you offer? (Answer: We offer personalised jewellery, memorial boxes, garden keepsakes, and grave plaques)
- How long does engraving take? (Answer: Typically 3-5 business days for personalisation, plus shipping time)
- Can I add photos to keepsakes? (Answer: Yes, we offer photo engraving on many products)
- What materials do you use? (Answer: We use high-quality stainless steel, sterling silver, wood, stone, and other durable materials)
- Do you ship internationally? (Answer: Yes, we ship to most countries. Contact us for specific shipping details)
- How do I place an order? (Answer: Visit our website at sacredkeepsakes.co.uk, browse products, and add items to cart. You can customize during checkout)
- Can I return personalized items? (Answer: Due to the custom nature, we cannot accept returns unless there is a defect. Please contact us if there are any issues)

Your behavior:
- ALWAYS reply in clear, friendly, compassionate English
- Be empathetic and sensitive as customers are often dealing with loss
- Keep answers SHORT and conversational (2-4 sentences maximum)
- NO bullet points, NO asterisks, NO markdown formatting, NO special symbols
- Write in plain sentences only, like normal conversation
- NEVER use placeholders like [Your Name], [Insert X], or any text in square brackets
- NEVER introduce yourself with a name - just be helpful immediately
- Start responses naturally without formal greetings or placeholder text
- If asked about products not listed, politely suggest contacting via email for custom requests
- If asked about pricing, direct them to the website or suggest emailing for quotes
- Be warm, supportive, and professional
- Never say you don't know something - provide helpful guidance or direct to contact email
- For booking/ordering, direct customers to the website or email
- IMPORTANT: Only offer condolences when the customer explicitly mentions a loss or grief. For general inquiries, product questions, or other topics, respond normally without mentioning loss.`
        },

        'sulla-vita': {
          name: 'Sulla Vita',
          systemPrompt: `You are a friendly and helpful customer service assistant for Sulla Vita, a Mediterranean restaurant in Leavenworth, Washington.

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
- Always be positive about the restaurant and customer experience`
        },

        // ADD NEW BUSINESSES HERE - Just copy this template:
        // 'your-business-id': {
        //   name: 'Your Business Name',
        //   systemPrompt: `Your complete system prompt here...`
        // },

        'default': {
          name: 'Customer Support',
          systemPrompt: `You are a helpful and friendly customer support assistant. Provide clear, concise, and helpful responses to customer inquiries.`
        }
      };

      // Get the appropriate business config
      const config = businessConfigs[businessId] || businessConfigs['default'];
      
      // Build the full prompt with system instructions and user message separated
      const fullPrompt = `${config.systemPrompt}

Customer question: ${userMessage}

Respond directly to the customer's question. Be helpful and conversational.`;

      // Construct the Google AI Studio API request
      const gemmaUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      
      const gemmaRequest = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: body.temperature || 0.7,
          topK: body.topK || 20,
          topP: body.topP || 0.8,
          maxOutputTokens: body.maxOutputTokens || 300,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      // Call the Google AI Studio API
      const gemmaResponse = await fetch(gemmaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gemmaRequest),
      });

      const gemmaData = await gemmaResponse.json();

      // Check for errors
      if (!gemmaResponse.ok) {
        console.error('Gemma API Error:', gemmaData);
        return new Response(JSON.stringify({ 
          success: false,
          error: gemmaData.error?.message || 'Failed to get response from Gemma',
          details: gemmaData
        }), {
          status: gemmaResponse.status,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
        });
      }

      // Extract the response text
      const responseText = gemmaData.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I\'m having trouble generating a response. Please contact us for assistance.';

      // Return the response in multiple formats for compatibility
      return new Response(JSON.stringify({
        success: true,
        reply: responseText,
        response: responseText,
        message: responseText,
        text: responseText,
        model: model,
        business: config.name
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