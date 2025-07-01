import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { LangChainRAGService } from './rag-langchain';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize RAG service
let ragService: LangChainRAGService;

try {
  ragService = new LangChainRAGService();
  console.log('RAG Service initialized successfully');
} catch (error) {
  console.error('Failed to initialize RAG Service:', error);
  process.exit(1);
}

// Health check endpoint
app.get('/health', (req: any, res: any) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'portfolio-chatbot-api'
  });
});

// Chat endpoint
app.post('/api/chat', async (req: any, res: any) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message is required and must be a non-empty string' 
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({ 
        error: 'Message is too long. Please keep it under 1000 characters.' 
      });
    }

    console.log(`Received chat request: ${message.substring(0, 100)}...`);

    const response = await ragService.query(message);
    
    console.log(`Generated response: ${response.substring(0, 100)}...`);
    
    res.json({ response });
  } catch (error) {
    console.error('❌ ERROR in chat endpoint:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    
    res.status(500).json({
      error: 'I apologize, but I encountered an error processing your request. Please try again.'
    });
  }
});

// Add document endpoint (for seeding)
app.post('/api/add-document', async (req: any, res: any) => {
  try {
    const { text, category, title, source } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Text is required and must be a string' 
      });
    }

    await ragService.addDocument(text, { text, category, title, source });
    
    res.json({ 
      message: 'Document added successfully',
      metadata: { category, title, source }
    });
  } catch (error) {
    console.error('Error adding document:', error);
    res.status(500).json({ 
      error: 'Failed to add document' 
    });
  }
});

// Add multiple documents endpoint
app.post('/api/add-documents', async (req: any, res: any) => {
  try {
    const { documents } = req.body;

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ 
        error: 'Documents array is required and must not be empty' 
      });
    }

    await ragService.addMultipleDocuments(documents);
    
    res.json({ 
      message: `${documents.length} documents added successfully` 
    });
  } catch (error) {
    console.error('Error adding documents:', error);
    res.status(500).json({ 
      error: 'Failed to add documents' 
    });
  }
});

// Search endpoint (for testing)
app.post('/api/search', async (req: any, res: any) => {
  try {
    const { query, topK = 5 } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Query is required and must be a string' 
      });
    }

    const results = await ragService.searchSimilar(query, topK);
    
    res.json({ results });
  } catch (error) {
    console.error('Error in search endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to search documents' 
    });
  }
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});

// 404 handler
app.use((req: any, res: any) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Portfolio Chatbot API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🔍 Search endpoint: http://localhost:${PORT}/api/search`);
});

export default app;