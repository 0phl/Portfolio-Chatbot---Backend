import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { LangChainRAGService } from './rag-langchain';
import {
  securityHeaders,
  corsOptions,
  chatRateLimiter,
  apiRateLimiter,
  slowDownMiddleware,
  validateChatInput,
  sanitizeAndDetectSuspicious,
  requestLogger,
  ipProtection,
  markIPSuspicious,
  securityLogger,
  chatLogger,
  securityConfig,
  logSecurityEvent,
  perMessageRateLimiter,
  securityControls
} from './security';

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy configuration for proper IP detection
// This is essential for getting real client IPs from reverse proxies (Render, Heroku, etc.)
app.set('trust proxy', true);

// Security middleware (applied first)
app.use(securityHeaders);
app.use(requestLogger);
app.use(ipProtection);

// CORS with enhanced security
app.use(cors(corsOptions));

// Session configuration for chat tracking
app.use(session({
  secret: process.env.SESSION_SECRET || 'portfolio-chatbot-session-secret-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Smart rate limiting (re-enabled with better logic)
app.use(apiRateLimiter);
app.use(slowDownMiddleware);

// Body parsing with size limits
app.use(express.json({
  limit: '1mb', // Reduced from 10mb for security
  verify: (req: any, res: any, buf: Buffer) => {
    // Additional verification can be added here
    if (buf.length > 1024 * 1024) { // 1MB limit
      throw new Error('Request entity too large');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Initialize RAG service
let ragService: LangChainRAGService;

try {
  ragService = new LangChainRAGService();
  console.log('RAG Service initialized successfully');
} catch (error) {
  console.error('Failed to initialize RAG Service:', error);
  process.exit(1);
}

// Health check endpoint - exempt from rate limiting
app.get('/health', (_req: any, res: any) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'portfolio-chatbot-api'
  });
});

// Apply smart chat-specific middleware (re-enabled)
app.use('/api/chat', chatRateLimiter);

// Custom validation function for chat
const validateAndSanitizeChat = (req: any, res: any, next: any) => {
  // Validate message
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    securityLogger.warn('Invalid input', {
      ip: req.ip || 'unknown',
      error: 'Empty or invalid message',
      timestamp: new Date()
    });
    return res.status(400).json({
      error: 'Message is required and must be a non-empty string'
    });
  }

  if (message.length > securityConfig.maxMessageLength) {
    securityLogger.warn('Message too long', {
      ip: req.ip || 'unknown',
      messageLength: message.length,
      timestamp: new Date()
    });
    return res.status(400).json({
      error: `Message is too long. Please keep it under ${securityConfig.maxMessageLength} characters.`
    });
  }

  // Check for suspicious patterns (if enabled)
  if (securityControls.enableSuspiciousPatternDetection) {
    const suspiciousPattern = securityConfig.suspiciousPatterns.find(pattern =>
      pattern.test(message)
    );

    if (suspiciousPattern) {
      logSecurityEvent({
        type: 'suspicious_input',
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent'),
        message: `Suspicious pattern detected: ${message.substring(0, 100)}...`,
        timestamp: new Date(),
        severity: 'high'
      });

      return res.status(400).json({
        error: 'Your message contains content that cannot be processed. Please rephrase your question.'
      });
    }
  }

  // Sanitize input
  req.body.message = message
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, securityConfig.maxMessageLength); // Ensure length limit

  next();
};

// Chat endpoint with enhanced security
app.post('/api/chat', validateAndSanitizeChat, perMessageRateLimiter, async (req: any, res: any) => {
    const startTime = Date.now();
    const { message } = req.body;
    const clientIP = req.ip || 'unknown';

    // Generate or get session ID for tracking
    if (!req.session.chatSessionId) {
      req.session.chatSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      req.session.chatStartTime = new Date();
      req.session.messageCount = 0;

      // Log session start
      chatLogger.info('New chat session started', {
        type: 'chat_start',
        ip: clientIP,
        sessionId: req.session.chatSessionId,
        timestamp: new Date()
      });
    }

    req.session.messageCount = (req.session.messageCount || 0) + 1;

    try {
      const response = await ragService.query(message);
      const duration = Date.now() - startTime;

      // Professional chat logging with session tracking
      chatLogger.info('Chat interaction completed', {
        type: 'chat_interaction',
        ip: clientIP,
        sessionId: req.session.chatSessionId,
        messageNumber: req.session.messageCount,
        userMessage: message,
        botResponse: response,
        duration,
        timestamp: new Date()
      });

      res.json({ response });
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Professional error logging with session tracking
      chatLogger.error('Chat interaction failed', {
        type: 'chat_error',
        ip: clientIP,
        sessionId: req.session.chatSessionId,
        messageNumber: req.session.messageCount,
        userMessage: message,
        error: error.message,
        duration,
        timestamp: new Date()
      });

      // Log to security logger for monitoring
      securityLogger.error('Chat endpoint error', {
        ip: clientIP,
        sessionId: req.session.chatSessionId,
        error: error.message,
        timestamp: new Date()
      });

      // Mark IP as suspicious if error seems intentional
      if (error.message?.includes('quota') || error.message?.includes('rate')) {
        markIPSuspicious(clientIP);
      }

      res.status(500).json({
        error: 'I apologize, but I encountered an error processing your request. Please try again.'
      });
    }
  }
);

// Add document endpoint (for seeding) - with security
app.post('/api/add-document', async (req: any, res: any) => {
  try {
    const { text, category, title, source } = req.body;
    const clientIP = req.ip || 'unknown';

    // Enhanced validation
    if (!text || typeof text !== 'string') {
      securityLogger.warn('Invalid document upload attempt', {
        ip: clientIP,
        error: 'Missing or invalid text field',
        timestamp: new Date()
      });
      return res.status(400).json({
        error: 'Text is required and must be a string'
      });
    }

    if (text.length > 50000) { // 50KB limit for documents
      securityLogger.warn('Document too large', {
        ip: clientIP,
        textLength: text.length,
        timestamp: new Date()
      });
      return res.status(400).json({
        error: 'Document text is too large. Maximum 50,000 characters allowed.'
      });
    }

    await ragService.addDocument(text, { text, category, title, source });

    securityLogger.info('Document added successfully', {
      ip: clientIP,
      category,
      title,
      textLength: text.length,
      timestamp: new Date()
    });

    res.json({
      message: 'Document added successfully',
      metadata: { category, title, source }
    });
  } catch (error: any) {
    const clientIP = req.ip || 'unknown';
    securityLogger.error('Error adding document', {
      ip: clientIP,
      error: error.message,
      timestamp: new Date()
    });
    console.error('Error adding document:', error);
    res.status(500).json({
      error: 'Failed to add document'
    });
  }
});

// Add multiple documents endpoint - with security
app.post('/api/add-documents', async (req: any, res: any) => {
  try {
    const { documents } = req.body;
    const clientIP = req.ip || 'unknown';

    if (!Array.isArray(documents) || documents.length === 0) {
      securityLogger.warn('Invalid bulk document upload', {
        ip: clientIP,
        error: 'Invalid documents array',
        timestamp: new Date()
      });
      return res.status(400).json({
        error: 'Documents array is required and must not be empty'
      });
    }

    if (documents.length > 100) { // Limit bulk uploads
      securityLogger.warn('Bulk upload too large', {
        ip: clientIP,
        documentCount: documents.length,
        timestamp: new Date()
      });
      return res.status(400).json({
        error: 'Too many documents. Maximum 100 documents per batch.'
      });
    }

    await ragService.addMultipleDocuments(documents);

    securityLogger.info('Bulk documents added', {
      ip: clientIP,
      documentCount: documents.length,
      timestamp: new Date()
    });

    res.json({
      message: `${documents.length} documents added successfully`
    });
  } catch (error: any) {
    const clientIP = req.ip || 'unknown';
    securityLogger.error('Error adding bulk documents', {
      ip: clientIP,
      error: error.message,
      timestamp: new Date()
    });
    console.error('Error adding documents:', error);
    res.status(500).json({
      error: 'Failed to add documents'
    });
  }
});

// Search endpoint (for testing) - with security
app.post('/api/search', async (req: any, res: any) => {
  try {
    const { query, topK = 5 } = req.body;
    const clientIP = req.ip || 'unknown';

    if (!query || typeof query !== 'string') {
      securityLogger.warn('Invalid search query', {
        ip: clientIP,
        error: 'Missing or invalid query',
        timestamp: new Date()
      });
      return res.status(400).json({
        error: 'Query is required and must be a string'
      });
    }

    if (query.length > 500) { // Limit search query length
      securityLogger.warn('Search query too long', {
        ip: clientIP,
        queryLength: query.length,
        timestamp: new Date()
      });
      return res.status(400).json({
        error: 'Search query is too long. Maximum 500 characters allowed.'
      });
    }

    if (topK > 20) { // Limit number of results
      return res.status(400).json({
        error: 'Maximum 20 results allowed per search.'
      });
    }

    const results = await ragService.searchSimilar(query, topK);

    securityLogger.info('Search performed', {
      ip: clientIP,
      queryLength: query.length,
      resultsCount: results.length,
      timestamp: new Date()
    });

    res.json({ results });
  } catch (error: any) {
    const clientIP = req.ip || 'unknown';
    securityLogger.error('Search endpoint error', {
      ip: clientIP,
      error: error.message,
      timestamp: new Date()
    });
    console.error('Error in search endpoint:', error);
    res.status(500).json({
      error: 'Failed to search documents'
    });
  }
});

// Error handling middleware
app.use((err: any, _req: any, res: any, _next: any) => {
  const errorId = Math.random().toString(36).substring(2, 11);

  securityLogger.error('Unhandled application error', {
    errorId,
    error: err.message,
    stack: err.stack,
    timestamp: new Date()
  });

  console.error(`Unhandled error [${errorId}]:`, err);
  res.status(500).json({
    error: 'Internal server error',
    errorId // Include error ID for tracking
  });
});

// 404 handler
app.use((_req: any, res: any) => {
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