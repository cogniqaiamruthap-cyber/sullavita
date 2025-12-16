// Configuration
const GEMINI_API_KEY = 'AIzaSyBv57sRvrvdrO5EBFO8MRWAoUNhxzdYoGE'; // Replace with your actual API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Business Information
const BUSINESS_INFO = {
    name: 'Sulla Vita',
    website: 'sullavita.com',
    location: '931 Front St, Leavenworth, WA 98826, United States',
    phone: '+1 509-679-1114',
    email: 'sullavita931@gmail.com',
    instagram: 'https://www.instagram.com/sulla_vita',
    
    services: [
        'Mediterranean bites',
        'Wood-fired pizza',
        'Craft beer',
        'Dine-in service',
        'Takeaway',
        'Online ordering'
    ],
    
    features: [
        'Rustic locale with patio seating',
        'Outdoor dining available',
        'Trendy food concept',
        'High-quality craft beer selection',
        'Fresh Mediterranean ingredients'
    ],
    
    hours: 'Opens at 4 PM on Fridays (hours vary by day)',
    
    faqs: {
        'patio': 'Yes! We have a beautiful patio for outdoor dining. Patio seating is available on a first-come, first-served basis.',
        'reservations': 'We primarily operate on a walk-in basis due to high volume. For large parties, please call us at +1 509-679-1114 to discuss arrangements.',
        'ordering': 'You can order online through our website sullavita.com, call us for takeaway at +1 509-679-1114, or dine in at our restaurant.',
        'beer': 'We feature a rotating selection of craft beers on tap. Our beer list changes regularly to offer you the best seasonal and local options.',
        'menu': 'We specialize in authentic Mediterranean bites and wood-fired pizzas. Our menu features fresh ingredients and traditional recipes.',
        'parking': 'Street parking is available on Front Street and surrounding areas in downtown Leavenworth.',
        'groups': 'For large groups or parties, please call us at +1 509-679-1114 in advance so we can best accommodate your party.',
        'catering': 'For catering inquiries, please contact us via email at sullavita931@gmail.com or call +1 509-679-1114.'
    }
};

// System prompt for Gemini
const SYSTEM_CONTEXT = `You are a professional and friendly customer service assistant for Sulla Vita, a highly-rated Mediterranean restaurant in Leavenworth, Washington.

RESTAURANT PROFILE:
- Business Name: Sulla Vita
- Location: 931 Front St, Leavenworth, WA 98826, United States
- Website: sullavita.com
- Phone: +1 509-679-1114
- Email: sullavita931@gmail.com
- Instagram: @sulla_vita (https://www.instagram.com/sulla_vita)
- Reputation: 704 positive reviews - highly popular destination

CUISINE & SPECIALTIES:
We specialize in authentic Mediterranean cuisine featuring:
- Wood-fired pizzas made with artisan techniques and fresh ingredients
- Mediterranean small plates and appetizers
- Rotating selection of premium craft beers on tap
- Rustic, warm atmosphere with both indoor and outdoor patio seating

DINING OPTIONS:
- Dine-in service in our rustic locale
- Takeaway orders available
- Online ordering through sullavita.com
- Beautiful patio seating (first-come, first-served)

RESERVATIONS & SEATING:
- We primarily operate on a walk-in basis due to high customer volume
- For large parties (6+ guests), we recommend calling ahead at +1 509-679-1114 to discuss arrangements
- Patio seating is available based on weather and availability

OPERATING HOURS:
- Hours vary by day of the week
- We open at 4:00 PM on Fridays
- Please check sullavita.com or call for current daily hours as they are updated regularly

CRAFT BEER PROGRAM:
- Rotating selection of local and regional craft beers on tap
- Our beer menu changes regularly to feature seasonal and special releases
- Ask our staff about current offerings when you visit

SPECIAL SERVICES:
- Large group accommodations (advance notice required)
- Catering inquiries welcome - contact us at sullavita931@gmail.com or call +1 509-679-1114
- Perfect for special occasions and gatherings

COMMUNICATION STYLE:
- Be warm, professional, and enthusiastic about our restaurant
- Provide complete, helpful answers (3-5 sentences when appropriate)
- Show genuine hospitality and Mediterranean warmth
- If you don't have specific information, direct guests to call or visit our website
- Never make up menu items, prices, or specific beer selections
- Encourage online ordering and visits to experience our authentic cuisine
- Emphasize our commitment to quality ingredients and wood-fired cooking

EMOJI USAGE GUIDELINES:
Use these emojis appropriately to enhance responses:
🍕 Pizza, food, menu
🍺 Craft beer, drinks
🌿 Mediterranean, fresh ingredients
📍 Location, address
📞 Phone contact
✉️ Email contact
⏰ Hours, timing
🪑 Seating, patio
👥 Groups, parties
🎉 Events, celebrations
✨ Special features
🌟 Quality, excellence
☀️ Patio, outdoor dining
🏛️ Rustic atmosphere



COMMON CUSTOMER QUESTIONS:
1. Patio Availability: Our beautiful patio is available on a first-come, first-served basis, weather permitting
2. Craft Beer Selection: Our tap list rotates regularly - call or visit to hear about current offerings
3. Large Groups: Call +1 509-679-1114 in advance to ensure we can accommodate your party
4. Catering: Email sullavita931@gmail.com or call for catering inquiries
5. Hours: Check sullavita.com for most current hours as they vary by day

Remember: You represent a beloved local establishment known for authentic Mediterranean flavors, quality ingredients, and warm hospitality. Make every interaction reflect these values.`;

// DOM Elements
const chatButton = document.getElementById('chatButton');
const chatWidget = document.getElementById('chatWidget');
const closeChat = document.getElementById('closeChat');
const deleteChat = document.getElementById('deleteChat');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');

// State
let conversationHistory = [];

// Event Listeners
chatButton.addEventListener('click', openChat);
closeChat.addEventListener('click', closeChat_);
deleteChat.addEventListener('click', deleteChatHistory);
sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});


document.addEventListener('click', (e) => {
    if (e.target.classList.contains('quick-reply')) {
        const message = e.target.getAttribute('data-message');
        chatInput.value = message;
        sendMessage();
    }
});

// Functions
function openChat() {
    chatWidget.classList.add('open');
    chatButton.style.display = 'none';
    chatInput.focus();
}

function closeChat_() {
    chatWidget.classList.remove('open');
    chatButton.style.display = 'flex';
}

function deleteChatHistory() {
    // Show confirmation
    if (confirm('Are you sure you want to clear the chat history?')) {
        // Clear messages except the welcome message
        const welcomeMessage = chatMessages.querySelector('.message');
        chatMessages.innerHTML = '';
        if (welcomeMessage) {
            chatMessages.appendChild(welcomeMessage.cloneNode(true));
        }
        
        // Reset conversation history
        conversationHistory = [];
        
        // Re-attach quick reply listeners
        attachQuickReplyListeners();
        
        // Show confirmation
        setTimeout(() => {
            addMessage('Chat history cleared! How can I help you today?');
        }, 300);
    }
}

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (typeof content === 'string') {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            if (line.trim()) {
                const p = document.createElement('p');
                p.textContent = line;
                contentDiv.appendChild(p);
            }
        });
    } else {
        contentDiv.appendChild(content);
    }
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';
    
    const typingContent = document.createElement('div');
    typingContent.className = 'typing-indicator';
    typingContent.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    typingDiv.appendChild(typingContent);
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showResponseBubbles() {
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message bot-message';
    bubbleDiv.id = 'response-bubbles';
    
    const bubbleContent = document.createElement('div');
    bubbleContent.className = 'message-content';
    bubbleContent.style.padding = '16px 20px';
    bubbleContent.innerHTML = '<span class="response-bubble"></span><span class="response-bubble"></span><span class="response-bubble"></span>';
    
    bubbleDiv.appendChild(bubbleContent);
    chatMessages.appendChild(bubbleDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeResponseIndicators() {
    const typingIndicator = document.getElementById('typing-indicator');
    const responseBubbles = document.getElementById('response-bubbles');
    
    if (typingIndicator) {
        typingIndicator.remove();
    }
    if (responseBubbles) {
        responseBubbles.remove();
    }
}

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage(message, true);
    chatInput.value = '';
    sendButton.disabled = true;
    
    // Show typing indicator first
    showTypingIndicator();
    
    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        parts: [{ text: message }]
    });
    
    // Switch to bubbles after 800ms
    const bubbleTimeout = setTimeout(() => {
        removeResponseIndicators();
        showResponseBubbles();
    }, 800);
    
    try {
        // Check for quick responses first
        const quickResponse = getQuickResponse(message);
        if (quickResponse) {
            // Wait minimum 1600ms for animation
            await new Promise(resolve => setTimeout(resolve, 1600));
            
            clearTimeout(bubbleTimeout);
            removeResponseIndicators();
            addMessageWithStream(quickResponse);
            conversationHistory.push({
                role: 'model',
                parts: [{ text: quickResponse }]
            });
            sendButton.disabled = false;
            return;
        }
        
        // Call Gemini API
        const response = await callGeminiAPI(message);
        
        // Clear timeout and remove indicators
        clearTimeout(bubbleTimeout);
        removeResponseIndicators();
        addMessageWithStream(response);
        
        conversationHistory.push({
            role: 'model',
            parts: [{ text: response }]
        });
        sendButton.disabled = false;
    } catch (error) {
        clearTimeout(bubbleTimeout);
        removeResponseIndicators();
        console.error('Error:', error);
        addMessage('I apologize, but I\'m having trouble connecting right now. Please call us at +1 509-679-1114 or email sullavita931@gmail.com for immediate assistance.');
        sendButton.disabled = false;
    }
}

function addMessageWithStream(content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message streaming-message';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        if (line.trim()) {
            const p = document.createElement('p');
            p.textContent = line;
            contentDiv.appendChild(p);
        }
    });
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getQuickResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Hours
    if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
        return `We're delighted you're interested in visiting Sulla Vita! Our hours vary by day of the week, with Friday opening at 4:00 PM. For the most current daily hours, please visit our website at ${BUSINESS_INFO.website} or give us a call at ${BUSINESS_INFO.phone}. We update our hours regularly to serve you better!`;
    }
    
    // Location
    if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where') || lowerMessage.includes('find you')) {
        return `You'll find us in the heart of beautiful downtown Leavenworth at ${BUSINESS_INFO.location}. We're located on Front Street, making us easy to find while you explore the charming Bavarian village. Street parking is available nearby. We look forward to welcoming you! 🍕`;
    }
    
    // Contact
    if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email') || lowerMessage.includes('reach')) {
        return `We'd love to hear from you! You can reach our team at:\n\n📞 Phone: ${BUSINESS_INFO.phone}\n📧 Email: ${BUSINESS_INFO.email}\n📱 Instagram: @sulla_vita\n🌐 Website: ${BUSINESS_INFO.website}\n\nFeel free to contact us for reservations, catering inquiries, or any questions about our menu!`;
    }
    
    // Patio
    if (lowerMessage.includes('patio') || lowerMessage.includes('outdoor') || lowerMessage.includes('outside')) {
        return `Yes, we have a beautiful patio for outdoor dining! Our patio seating offers a wonderful al fresco experience in downtown Leavenworth and is available on a first-come, first-served basis, weather permitting. It's the perfect spot to enjoy our wood-fired pizzas and craft beers on a lovely day. We recommend arriving early during peak times to secure patio seating!`;
    }
    
    // Reservations
    if (lowerMessage.includes('reservation') || lowerMessage.includes('book') || lowerMessage.includes('table')) {
        return `Thank you for your interest in dining with us! Due to our high volume and popularity (704 positive reviews!), we primarily operate on a walk-in basis to serve as many guests as possible. However, for large parties of 6 or more guests, we highly recommend calling us in advance at ${BUSINESS_INFO.phone} so we can discuss arrangements and ensure we can accommodate your group properly.`;
    }
    
    // Menu
    if (lowerMessage.includes('menu') || lowerMessage.includes('food') || lowerMessage.includes('serve') || lowerMessage.includes('eat')) {
        return `We specialize in authentic Mediterranean cuisine with a focus on quality and tradition! Our menu features delicious Mediterranean small plates, artisan wood-fired pizzas made with fresh ingredients, and a rotating selection of premium craft beers. Each dish is prepared with care in our rustic kitchen. Visit our website at ${BUSINESS_INFO.website} to explore our full menu and place an online order for takeaway!`;
    }
    
    // Beer
    if (lowerMessage.includes('beer') || lowerMessage.includes('drink') || lowerMessage.includes('tap') || lowerMessage.includes('beverage')) {
        return `Our craft beer program is something we're quite proud of! We feature a carefully curated, rotating selection of premium craft beers on tap, including local and regional favorites. Our beer list changes regularly to bring you seasonal releases and special selections. For our current tap list, please call us at ${BUSINESS_INFO.phone} or stop by - our knowledgeable staff will be happy to guide you through our offerings!`;
    }
    
    // Catering
    if (lowerMessage.includes('cater') || lowerMessage.includes('event') || lowerMessage.includes('party')) {
        return `We'd be honored to cater your special event! Sulla Vita offers catering services featuring our signature Mediterranean cuisine and wood-fired pizzas. For catering inquiries, menu options, and availability, please contact us at ${BUSINESS_INFO.email} or call ${BUSINESS_INFO.phone}. Our team will work with you to create a memorable dining experience for your guests!`;
    }
    
    return null;
}

async function callGeminiAPI(userMessage) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        return 'API key not configured. Please add your Gemini API key to the chatbot.js file. Meanwhile, feel free to call us at +1 509-679-1114!';
    }
    
    const requestBody = {
        contents: [
            {
                parts: [{ text: SYSTEM_CONTEXT }]
            },
            ...conversationHistory
        ],
        generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 500,
            topP: 0.9,
            topK: 40
        }
    };
    
    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('Unexpected API response format');
}

// Initialize
console.log('Sulla Vita Chatbot initialized');