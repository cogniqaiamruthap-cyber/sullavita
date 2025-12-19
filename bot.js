// bot.js - Website Chatbot JavaScript
// This file handles the chatbot UI and communicates with your Cloudflare Worker

// Business Information
const BUSINESS_INFO = {
    name: 'Sulla Vita',
    website: 'sullavita.com',
    location: '931 Front St, Leavenworth, WA 98826, United States',
    phone: '+1 509-679-1114',
    email: 'sullavita931@gmail.com',
    instagram: 'https://www.instagram.com/sulla_vita',
    description: 'Mediterranean bites, wood-fired pizza, and craft beer in a rustic locale with a patio',
    services: ['Dine-in', 'Takeaway', 'Order online'],
    reviews: '704 reviews'
};

// Your Cloudflare Worker URL
const WORKER_URL = 'https://odd-unit-89b0.cogniqaiamruthap.workers.dev';

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
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
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
    if (confirm('Are you sure you want to clear the chat history?')) {
        const welcomeMessage = chatMessages.querySelector('.message');
        chatMessages.innerHTML = '';
        if (welcomeMessage) {
            chatMessages.appendChild(welcomeMessage.cloneNode(true));
        }
        
        conversationHistory = [];
        attachQuickReplyListeners();
        
        setTimeout(() => {
            addMessage('Chat history cleared! How can I help you today? 🍕');
        }, 300);
    }
}

function attachQuickReplyListeners() {
    const quickReplyButtons = document.querySelectorAll('.quick-reply');
    quickReplyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const message = e.target.getAttribute('data-message');
            if (message) {
                chatInput.value = message;
                sendMessage();
            }
        });
    });
}

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (typeof content === 'string') {
        const lines = content.split('\n');
        lines.forEach((line) => {
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
    
    if (typingIndicator) typingIndicator.remove();
    if (responseBubbles) responseBubbles.remove();
}

// Helper function to remove markdown formatting
function removeMarkdown(text) {
    if (!text) return '';
    
    // Remove bold (**text** or __text__)
    text = text.replace(/\*\*(.+?)\*\*/g, '$1');
    text = text.replace(/__(.+?)__/g, '$1');
    
    // Remove italic (*text* or _text_)
    text = text.replace(/\*(.+?)\*/g, '$1');
    text = text.replace(/_(.+?)_/g, '$1');
    
    // Remove headers (#)
    text = text.replace(/^#{1,6}\s+/gm, '');
    
    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, '');
    text = text.replace(/`(.+?)`/g, '$1');
    
    // Remove other markdown symbols
    text = text.replace(/[*_~`#]/g, '');
    
    return text;
}

function getQuickResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
        return `⏰ Our hours vary daily. Friday we open at 4:00 PM. For current hours, visit ${BUSINESS_INFO.website} or call ${BUSINESS_INFO.phone}.`;
    }
    
    if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where') || lowerMessage.includes('find you')) {
        return `📍 We're located at ${BUSINESS_INFO.location}, right on Front Street in downtown Leavenworth. Street parking available nearby!`;
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email') || lowerMessage.includes('reach')) {
        return `📞 Phone: ${BUSINESS_INFO.phone}\n📧 Email: ${BUSINESS_INFO.email}\n📱 Instagram: @sulla_vita\n🌐 ${BUSINESS_INFO.website}`;
    }
    
    if (lowerMessage.includes('patio') || lowerMessage.includes('outdoor') || lowerMessage.includes('outside')) {
        return `☀️ Yes! We have a rustic patio for outdoor dining, first-come first-served. Perfect for enjoying our pizzas and craft beers. Arrive early during peak times!`;
    }
    
    if (lowerMessage.includes('reservation') || lowerMessage.includes('book') || lowerMessage.includes('table')) {
        return `🪑 We operate on a walk-in basis. For large parties (6+ guests), please call us at ${BUSINESS_INFO.phone} to arrange seating.`;
    }
    
    if (lowerMessage.includes('menu') || lowerMessage.includes('food') || lowerMessage.includes('serve') || lowerMessage.includes('eat')) {
        return `🍕 We serve Mediterranean small plates, wood-fired pizzas, and craft beers. Visit ${BUSINESS_INFO.website} to view our menu and order online for takeaway!`;
    }
    
    if (lowerMessage.includes('beer') || lowerMessage.includes('drink') || lowerMessage.includes('tap') || lowerMessage.includes('beverage')) {
        return `🍺 We have a rotating selection of premium craft beers on tap. Our list changes regularly with seasonal favorites. Call ${BUSINESS_INFO.phone} or stop by for the current selection!`;
    }
    
    if (lowerMessage.includes('cater') || lowerMessage.includes('event') || lowerMessage.includes('party')) {
        return `🎉 We offer catering with our Mediterranean cuisine and wood-fired pizzas. Contact us at ${BUSINESS_INFO.email} or ${BUSINESS_INFO.phone} for inquiries!`;
    }
    
    if (lowerMessage.includes('review') || lowerMessage.includes('rating') || lowerMessage.includes('popular')) {
        return `⭐ We're proud to have over 700 reviews! Our wood-fired pizzas and Mediterranean bites have made us a local favorite. Come see what everyone loves!`;
    }
    
    if (lowerMessage.includes('takeaway') || lowerMessage.includes('takeout') || lowerMessage.includes('to go') || lowerMessage.includes('pickup')) {
        return `🥡 Yes! We offer takeaway and online ordering. Place your order at ${BUSINESS_INFO.website} or call ${BUSINESS_INFO.phone}. We also have dine-in with patio seating!`;
    }
    
    return null;
}

async function callGeminiViaWorker(message) {
    try {
        console.log('Calling worker at:', WORKER_URL);
        console.log('With message:', message);
        
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message
            })
        });

        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            console.error('Worker error:', data);
            throw new Error(`Worker returned ${response.status}: ${data.error || 'Unknown error'}`);
        }
        
        if (data.success && data.reply) {
            // Remove markdown formatting from the response
            const cleanReply = removeMarkdown(data.reply);
            console.log('Clean reply:', cleanReply);
            return cleanReply;
        } else {
            console.error('Invalid response format:', data);
            throw new Error('Invalid response from worker - missing reply field');
        }
    } catch (error) {
        console.error('Error calling worker:', error);
        throw error;
    }
}

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    addMessage(message, true);
    chatInput.value = '';
    sendButton.disabled = true;
    
    showTypingIndicator();
    
    conversationHistory.push({
        role: 'user',
        parts: [{ text: message }]
    });
    
    const bubbleTimeout = setTimeout(() => {
        removeResponseIndicators();
        showResponseBubbles();
    }, 800);
    
    try {
        // Check for quick responses first
        const quickResponse = getQuickResponse(message);
        if (quickResponse) {
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
        
        // Call Cloudflare Worker (which calls Gemini)
        const response = await callGeminiViaWorker(message);
        
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
        addMessage(`I apologize, but I'm having trouble connecting right now. Please call us at ${BUSINESS_INFO.phone} or email ${BUSINESS_INFO.email} for immediate assistance. 📞`);
        sendButton.disabled = false;
    }
}

function addMessageWithStream(content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message streaming-message';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const lines = content.split('\n');
    lines.forEach((line) => {
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

// Initialize quick reply listeners on page load
document.addEventListener('DOMContentLoaded', () => {
    attachQuickReplyListeners();
    console.log('Chatbot initialized with worker URL:', WORKER_URL);
});