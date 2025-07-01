# Quick Setup Guide

Follow these steps to get your RAG chatbot backend running.

## 🚀 Quick Start (5 minutes)

### 1. Get API Keys

**Google AI (Gemini) API Key:**
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Create a new API key
4. Copy the key

**Pinecone API Key:**
1. Sign up at [Pinecone](https://www.pinecone.io/)
2. Create a new project
3. Go to "API Keys" and copy your key
4. Create a new index:
   - **Name**: `portfolio-chatbot` (or your choice)
   - **Dimensions**: `768`
   - **Metric**: `cosine`
   - **Cloud**: `AWS` (free tier)
   - **Region**: Choose closest to you

### 2. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
GOOGLE_AI_API_KEY=your_actual_gemini_key_here
PINECONE_API_KEY=your_actual_pinecone_key_here
PINECONE_INDEX=portfolio-chatbot
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Test the Setup

Start the development server:
```bash
npm run dev
```

You should see:
```
✅ RAG Service initialized successfully
🚀 Portfolio Chatbot API server running on port 3000
📍 Health check: http://localhost:3000/health
💬 Chat endpoint: http://localhost:3000/api/chat
🔍 Search endpoint: http://localhost:3000/api/search
```

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

### 4. Seed with Sample Data

In a new terminal:
```bash
npm run seed
```

This will populate your vector database with sample portfolio data.

### 5. Test the Chat

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about your experience"}'
```

## 🔧 Customizing Your Content

### Option 1: Use the Content Template

1. Open `content-template.md`
2. Fill in your personal information
3. Copy content sections to the seeding script
4. Run `npm run seed:custom`

### Option 2: Direct API Seeding

Use the `/api/add-document` endpoint to add your content:

```bash
curl -X POST http://localhost:3000/api/add-document \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am a software developer with 5 years of experience...",
    "category": "about",
    "title": "Professional Background",
    "source": "portfolio"
  }'
```

### Option 3: Bulk Upload

Use the `/api/add-documents` endpoint:

```bash
curl -X POST http://localhost:3000/api/add-documents \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "text": "Your first content piece...",
        "category": "about",
        "title": "About Me"
      },
      {
        "text": "Your skills and experience...",
        "category": "skills",
        "title": "Technical Skills"
      }
    ]
  }'
```

## 🌐 Deploy to Render

### 1. Prepare for Deployment

1. Push your code to GitHub
2. Make sure `.env` is in `.gitignore` (it already is)
3. Test locally one more time

### 2. Deploy on Render

1. Go to [Render](https://render.com/)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: 18 (or latest)

### 3. Set Environment Variables

In Render dashboard, add these environment variables:
```
GOOGLE_AI_API_KEY=your_gemini_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=your_index_name
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://your-portfolio-domain.github.io
```

### 4. Deploy and Test

1. Deploy the service
2. Wait for deployment to complete
3. Test your live API:
   ```bash
   curl https://your-app-name.onrender.com/health
   ```

### 5. Seed Production Database

```bash
curl -X POST https://your-app-name.onrender.com/api/add-documents \
  -H "Content-Type: application/json" \
  -d '{"documents": [your_portfolio_content]}'
```

## 🔗 Frontend Integration

Update your existing chatbot component to use the new API:

```typescript
// Replace your existing getBotResponse function with:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!input.trim()) return;

  // Add user message
  const userMessage = {
    text: input,
    sender: 'user',
    timestamp: new Date(),
    id: `user-${Date.now()}`
  };
  setMessages(prev => [...prev, userMessage]);
  setInput('');
  setIsTyping(true);

  try {
    const response = await fetch('https://your-api-url.onrender.com/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: input }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    
    const botMessage = {
      text: data.response,
      sender: 'bot',
      timestamp: new Date(),
      id: `bot-${Date.now()}`
    };
    
    setMessages(prev => [...prev, botMessage]);
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = {
      text: "I'm sorry, I encountered an error. Please try again.",
      sender: 'bot',
      timestamp: new Date(),
      id: `error-${Date.now()}`
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsTyping(false);
  }
};
```

## 🛠 Troubleshooting

### Common Issues

**"RAG Service failed to initialize"**
- Check your API keys in `.env`
- Verify Pinecone index exists and has correct dimensions (768)
- Check internet connection

**"Failed to generate embedding"**
- Verify Google AI API key is correct
- Check API quota/limits in Google AI Studio

**"Pinecone connection failed"**
- Verify Pinecone API key and index name
- Check if index exists in Pinecone dashboard

**"No relevant content found"**
- Make sure you've seeded the database with content
- Try different search queries
- Check if embeddings were created successfully

### Debug Mode

Set environment variable for more detailed logging:
```env
NODE_ENV=development
```

### Check Vector Database Content

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "topK": 5}'
```

## 📞 Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Test each component separately (API keys, database connection, embeddings)
4. Review the detailed README.md for comprehensive documentation

## 🎯 Next Steps

Once your backend is running:

1. ✅ Customize content with your personal information
2. ✅ Deploy to Render
3. ✅ Update frontend to use the new API
4. ✅ Test end-to-end functionality
5. ✅ Monitor usage and optimize as needed

Your RAG-powered portfolio chatbot is ready to go! 🚀