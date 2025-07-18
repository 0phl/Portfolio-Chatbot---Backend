# Frontend Session Setup Guide

## 🎯 Problem
Your chatbot backend now uses **session-based memory** to maintain conversation history. Each user gets their own isolated conversation memory, but your frontend needs to be configured properly to maintain sessions.

## 🔧 Required Frontend Configuration

### 1. **Enable Credentials in API Calls**

The most important requirement is that your frontend must send cookies with every API request to maintain the session.

#### Using `fetch()`:
```javascript
// ✅ CORRECT - Include credentials
fetch('/api/chat', {
  method: 'POST',
  credentials: 'include', // 🚨 THIS IS CRUCIAL!
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ message: userMessage })
})

// ❌ WRONG - No credentials
fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ message: userMessage })
})
```

#### Using `axios`:
```javascript
// Option 1: Set globally for all requests
axios.defaults.withCredentials = true;

// Option 2: Set per request
axios.post('/api/chat', 
  { message: userMessage }, 
  { withCredentials: true }
)

// Option 3: Create axios instance with credentials
const apiClient = axios.create({
  baseURL: 'http://your-backend-url',
  withCredentials: true
});
```

### 2. **CORS Configuration Check**

Make sure your frontend domain is included in your backend's allowed origins. Your backend already has `credentials: true` in CORS settings, which is correct.

If your frontend runs on `http://localhost:3000`, ensure it's in your backend's `ALLOWED_ORIGINS` environment variable:

```env
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

### 3. **Complete Frontend Example**

Here's a complete example of a chat component that maintains sessions:

```javascript
// React example
import { useState } from 'react';

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    // Add user message to UI
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);

    try {
      // 🚨 IMPORTANT: credentials: 'include' maintains session
      const response = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'include', // This maintains the session!
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add bot response to UI
      setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
      
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.text}
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          disabled={loading}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
```

### 4. **Testing Session Persistence**

To verify sessions are working:

1. **Open your chatbot**
2. **Send a message**: "My name is John"
3. **Send another message**: "What's my name?"
4. **Expected result**: The bot should remember your name from the previous message

If the bot doesn't remember, check:
- Browser developer tools → Network tab → Look for `Set-Cookie` headers
- Ensure `credentials: 'include'` is in all API calls
- Check that cookies are being sent in subsequent requests

### 5. **Environment-Specific Notes**

#### Development (localhost):
- Sessions should work automatically with `credentials: 'include'`
- Make sure frontend and backend ports are in CORS allowed origins

#### Production:
- Ensure your frontend domain is in `ALLOWED_ORIGINS`
- Set `SESSION_SECRET` environment variable to a secure random string
- Consider using a session store (Redis) for better performance

### 6. **Common Issues & Solutions**

| Issue | Solution |
|-------|----------|
| New session every message | Add `credentials: 'include'` to fetch calls |
| CORS errors | Add frontend domain to `ALLOWED_ORIGINS` |
| Sessions not persisting | Check if cookies are being sent in Network tab |
| Bot doesn't remember context | Verify session ID stays the same across requests |

## 🚀 Quick Test

Add this to your browser console on your frontend page to test:

```javascript
// Test session persistence
fetch('/api/chat', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'My name is TestUser' })
})
.then(r => r.json())
.then(console.log);

// Then immediately test memory:
fetch('/api/chat', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'What is my name?' })
})
.then(r => r.json())
.then(console.log);
```

If working correctly, the second response should reference "TestUser"!

---

## ✅ Summary

**The key fix**: Add `credentials: 'include'` to ALL your API calls to the chatbot backend. This ensures cookies (which contain the session ID) are sent with each request, allowing the backend to maintain conversation memory per user.
