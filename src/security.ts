import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { SecurityConfig, SecurityEvent } from './types';
import { Request, Response, NextFunction } from 'express';

// Security configuration
export const securityConfig: SecurityConfig = {
  maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH || '1000'),
  maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '50'), // Much higher for shared IPs
  maxRequestsPerHour: parseInt(process.env.MAX_REQUESTS_PER_HOUR || '500'), // Much higher for shared IPs
  slowDownThreshold: parseInt(process.env.SLOW_DOWN_THRESHOLD || '20'), // Higher threshold
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://localhost:3000',
    'https://localhost:3001'
  ],
  suspiciousPatterns: [
    // Enhanced prompt injection patterns (more flexible)
    /ignore\s+\w*\s*(previous|above|all|prior|earlier)\s+\w*\s*(instructions?|prompts?|rules?|commands?)/i,
    /forget\s+\w*\s*(everything|all|previous|prior|what|earlier)/i,
    /you\s+are\s+now\s+\w*\s*(different|new|another|other|diff)/i,
    /disregard\s+\w*\s*(previous|all|above|earlier|prior)/i,
    /override\s+\w*\s*(previous|all|earlier)\s+\w*\s*(instructions?|commands?|rules?)/i,

    // System manipulation attempts
    /system\s*:\s*/i,
    /assistant\s*:\s*/i,
    /human\s*:\s*/i,
    /tell\s+me\s+(your|the)\s+system\s+prompt/i,
    /what\s+(is|are)\s+(your|the)\s+(system\s+)?(prompt|instructions)/i,
    /show\s+me\s+(your|the)\s+(prompt|instructions|system)/i,
    /reveal\s+(your|the)\s+(prompt|instructions|system)/i,

    // Role manipulation
    /act\s+as\s+(a\s+)?(different|new|another)/i,
    /pretend\s+(to\s+be|you\s+are)\s+(a\s+)?\w+/i,
    /roleplay\s+as/i,
    /simulate\s+(being|a)/i,

    // Code injection patterns
    /<\s*script\s*>/i,
    /javascript\s*:/i,
    /data\s*:\s*text\/html/i,
    /eval\s*\(/i,
    /function\s*\(/i,
    /document\s*\.\s*write/i,
    /window\s*\.\s*location/i,

    // SQL injection patterns
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+\w+\s+set/i,

    // XSS patterns
    /<\s*iframe/i,
    /<\s*object/i,
    /<\s*embed/i,
    /on\w+\s*=/i,
    /<\s*img\s+[^>]*src\s*=/i,

    // Excessive repetition (potential spam)
    /(.)\1{30,}/,  // Reduced from 50 to 30 for better detection
    // Extremely long words (potential buffer overflow attempts)
    /\w{150,}/,    // Reduced from 200 to 150 for better detection

    // Repeated punctuation spam
    /[!@#$%^&*()_+=\[\]{}|;:,.<>?]{20,}/,
    // Multiple question marks (spam indicator)
    /\?{5,}/,
    // Multiple exclamation marks (spam indicator)
    /!{10,}/,

    // Common spam content patterns
    /lorem\s+ipsum/i,
    /ipsum\s+dolor/i,
    /dolor\s+sit\s+amet/i,

    // Banana spam patterns (common bot test)
    /how\s+many\s+\w*\s*r\s+in\s+banana/i,
    /count\s+\w*\s*r\s+in\s+banana/i,
    /banana\s+\w*\s*r\s+count/i,
    /letter\s+r\s+in\s+banana/i,

    // Generic counting spam patterns
    /how\s+many\s+letters?\s+\w+\s+in\s+\w+/i,
    /count\s+letters?\s+in\s+\w+/i,

    // Test/spam phrases
    /this\s+is\s+a\s+test\s+message/i,
    /testing\s+\d+\s*\d*\s*\d*/i,
    /test\s+test\s+test/i
  ]
};

// Optional security controls
export const securityControls = {
  enableIPBlocking: process.env.ENABLE_IP_BLOCKING === 'true',
  enableSuspiciousPatternDetection: process.env.ENABLE_SUSPICIOUS_PATTERN_DETECTION !== 'false', // Default true
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Security logger with daily rotation
export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'portfolio-chatbot-security' },
  transports: [
    new DailyRotateFile({
      filename: 'logs/security-error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    }),
    new DailyRotateFile({
      filename: 'logs/security-combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true
    }),
    // Always enable console logging for Render (since file logs are ephemeral)
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

// Professional chat logger for clean conversation tracking
export const chatLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      if (meta.type === 'chat_interaction') {
        return `[${timestamp}] 💬 CHAT | IP: ${meta.ip} | Session: ${meta.sessionId} | Msg#${meta.messageNumber} | User: "${meta.userMessage}" | Bot: "${meta.botResponse}" | Duration: ${meta.duration}ms`;
      } else if (meta.type === 'chat_error') {
        return `[${timestamp}] ❌ ERROR | IP: ${meta.ip} | Session: ${meta.sessionId} | Msg#${meta.messageNumber} | User: "${meta.userMessage}" | Error: ${meta.error}`;
      } else if (meta.type === 'chat_start') {
        return `[${timestamp}] 🚀 SESSION START | IP: ${meta.ip} | Session: ${meta.sessionId}`;
      }
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  defaultMeta: { service: 'portfolio-chatbot-chat' },
  transports: [
    new DailyRotateFile({
      filename: 'logs/chat-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '50m',
      maxFiles: '60d',
      zippedArchive: true
    }),
    // Always enable console logging for Render (since file logs are ephemeral)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          if (meta.type === 'chat_interaction') {
            const userMsg = String(meta.userMessage || '');
            const botMsg = String(meta.botResponse || '');
            const sessionShort = String(meta.sessionId || '').split('_').pop() || 'unknown';
            return `[${timestamp}] 💬 ${meta.ip} [${sessionShort}#${meta.messageNumber}] → "${userMsg.substring(0, 1000)}${userMsg.length > 1000 ? '...' : ''}" → "${botMsg.substring(0, 1000)}${botMsg.length > 1000 ? '...' : ''}"`;
          } else if (meta.type === 'chat_error') {
            const userMsg = String(meta.userMessage || '');
            const sessionShort = String(meta.sessionId || '').split('_').pop() || 'unknown';
            return `[${timestamp}] ❌ ${meta.ip} [${sessionShort}#${meta.messageNumber}] → "${userMsg.substring(0, 1000)}${userMsg.length > 1000 ? '...' : ''}" → ERROR: ${meta.error}`;
          } else if (meta.type === 'chat_start') {
            const sessionShort = String(meta.sessionId || '').split('_').pop() || 'unknown';
            return `[${timestamp}] 🚀 ${meta.ip} → NEW SESSION [${sessionShort}]`;
          }
          return `[${timestamp}] ${level}: ${message}`;
        })
      )
    })
  ],
});

// Log security events
export function logSecurityEvent(event: SecurityEvent): void {
  securityLogger.warn('Security Event', {
    type: event.type,
    ip: event.ip,
    userAgent: event.userAgent,
    message: event.message,
    timestamp: event.timestamp,
    severity: event.severity
  });
}

// Track logged IPs to prevent spam
const loggedRateLimitIPs = new Map<string, number>();

// Smart rate limiting that considers multiple factors
export const createSmartRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max: max * 3, // Allow 3x more requests per IP to account for shared networks
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      // Use IP + User-Agent combination for better granularity
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      // Create a hash of IP + partial User-Agent to allow multiple users per IP
      const userHash = userAgent.substring(0, 50); // First 50 chars of user agent
      return `${ip}:${userHash}`;
    },
    handler: (req: Request, res: Response) => {
      const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      const lastLogged = loggedRateLimitIPs.get(clientIP) || 0;

      // Only log once per 5 minutes per IP to prevent spam
      if (now - lastLogged > 300000) { // 5 minutes = 300000ms
        // Only log to file, not console in production
        logSecurityEvent({
          type: 'rate_limit',
          ip: clientIP,
          userAgent: req.get('User-Agent'),
          message: `Rate limit exceeded: ${max} requests per ${windowMs}ms (further logs suppressed for 5min)`,
          timestamp: new Date(),
          severity: 'medium'
        });

        loggedRateLimitIPs.set(clientIP, now);
      }

      // Never log to console in production to prevent spam

      // Always send the response, but don't spam logs
      res.status(429).json({ error: message });
    },
    skip: (req: Request) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    }
  });
};

// Chat endpoint rate limiter (smarter)
export const chatRateLimiter = createSmartRateLimiter(
  60 * 1000, // 1 minute
  securityConfig.maxRequestsPerMinute,
  'Too many chat requests. Please wait a moment before trying again.'
);

// General API rate limiter (smarter)
export const apiRateLimiter = createSmartRateLimiter(
  60 * 60 * 1000, // 1 hour
  securityConfig.maxRequestsPerHour,
  'Too many API requests. Please try again later.'
);

// Slow down middleware for progressive delays (smarter)
export const slowDownMiddleware = slowDown({
  windowMs: 60 * 1000, // 1 minute
  delayAfter: securityConfig.slowDownThreshold,
  delayMs: (hits) => Math.min(hits * 200, 2000), // Max 2 second delay
  maxDelayMs: 2000, // Maximum delay of 2 seconds (reduced)
  skip: (req: Request) => req.path === '/health',
  keyGenerator: (req: Request) => {
    // Same smart key generation as rate limiter
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    const userHash = userAgent.substring(0, 50);
    return `${ip}:${userHash}`;
  }
});

// Enhanced spam detection system
const messageHashes = new Map<string, { count: number, lastSeen: number, firstSeen: number }>();
const ipMessageCounts = new Map<string, { count: number, lastReset: number }>();

export const perMessageRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const { message } = req.body;
  if (!message) return next();

  const clientIP = req.ip || 'unknown';
  const now = Date.now();

  // Create hash of message content (more comprehensive)
  const messageHash = message.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize spaces
    .trim()
    .substring(0, 150);

  // Track per-IP message frequency
  const ipData = ipMessageCounts.get(clientIP);
  if (ipData) {
    // Reset counter every 5 minutes
    if (now - ipData.lastReset > 300000) {
      ipData.count = 1;
      ipData.lastReset = now;
    } else {
      ipData.count++;

      // Block if more than 15 messages in 5 minutes from same IP
      if (ipData.count > 15) {
        logSecurityEvent({
          type: 'rate_limit',
          ip: clientIP,
          message: `IP sending too many messages: ${ipData.count} in 5 minutes`,
          timestamp: new Date(),
          severity: 'medium'
        });

        markIPSuspicious(clientIP);
        res.status(429).json({
          error: 'Too many messages. Please slow down and try again later.'
        });
        return;
      }
    }
  } else {
    ipMessageCounts.set(clientIP, { count: 1, lastReset: now });
  }

  // Track identical/similar message spam
  const existing = messageHashes.get(messageHash);
  if (existing) {
    const timeSinceFirst = now - existing.firstSeen;

    // If same message sent multiple times
    if (now - existing.lastSeen < 60000) { // Within 1 minute
      existing.count++;

      // Progressive blocking for repeated messages
      if (existing.count > 2) {
        logSecurityEvent({
          type: 'suspicious_input',
          ip: clientIP,
          message: `Repeated message spam: "${message.substring(0, 50)}..." (${existing.count} times)`,
          timestamp: new Date(),
          severity: 'medium'
        });

        markIPSuspicious(clientIP);
        res.status(429).json({
          error: 'Please avoid sending the same message repeatedly.'
        });
        return;
      }
    } else if (timeSinceFirst < 600000 && existing.count > 5) {
      // Same message more than 5 times in 10 minutes (even with gaps)
      logSecurityEvent({
        type: 'suspicious_input',
        ip: clientIP,
        message: `Long-term message spam: "${message.substring(0, 50)}..." (${existing.count} times in 10min)`,
        timestamp: new Date(),
        severity: 'high'
      });

      markIPSuspicious(clientIP);
      res.status(429).json({
        error: 'This message has been sent too many times. Please try asking something different.'
      });
      return;
    } else {
      // Reset count if enough time has passed
      existing.count = 1;
      existing.firstSeen = now;
    }
    existing.lastSeen = now;
  } else {
    messageHashes.set(messageHash, { count: 1, lastSeen: now, firstSeen: now });
  }

  next();
};

// Input validation middleware
export const validateChatInput = [
  body('message')
    .isString()
    .withMessage('Message must be a string')
    .isLength({ min: 1, max: securityConfig.maxMessageLength })
    .withMessage(`Message must be between 1 and ${securityConfig.maxMessageLength} characters`)
    .trim()
    .escape(), // Basic HTML escaping
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logSecurityEvent({
        type: 'validation_error',
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent'),
        message: `Validation failed: ${errors.array().map(e => e.msg).join(', ')}`,
        timestamp: new Date(),
        severity: 'low'
      });
      return res.status(400).json({
        error: 'Invalid input',
        details: errors.array()
      });
    }
    next();
  }
];

// Input sanitization and suspicious content detection
export const sanitizeAndDetectSuspicious = (req: Request, res: Response, next: NextFunction): void => {
  const { message } = req.body;

  if (!message) {
    return next();
  }

  // Check for suspicious patterns
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

    res.status(400).json({
      error: 'Your message contains content that cannot be processed. Please rephrase your question.'
    });
    return;
  }

  // Additional sanitization
  req.body.message = message
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, securityConfig.maxMessageLength); // Ensure length limit

  next();
};

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CORS configuration with enhanced security
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (securityConfig.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Log blocked origin
    logSecurityEvent({
      type: 'blocked_request',
      ip: 'unknown',
      message: `Blocked request from unauthorized origin: ${origin}`,
      timestamp: new Date(),
      severity: 'medium'
    });

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

// Request logging middleware (reduced logging)
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    };

    // Only log errors and important events to reduce spam
    if (res.statusCode >= 400) {
      securityLogger.warn('HTTP Error', logData);
    } else if (req.url.includes('/api/chat') && process.env.NODE_ENV === 'development') {
      // Only log chat requests in development
      securityLogger.info('Chat Request', logData);
    }
    // Skip logging successful health checks and other routine requests
  });

  next();
};

// IP-based blocking (simple in-memory store for demo)
const blockedIPs = new Set<string>();
const suspiciousIPs = new Map<string, { count: number, lastSeen: Date }>();

export const ipProtection = (req: Request, res: Response, next: NextFunction): void => {
  const clientIP = req.ip || 'unknown';

  // Skip IP protection if disabled
  if (!securityControls.enableIPBlocking) {
    return next();
  }

  // Check if IP is blocked
  if (blockedIPs.has(clientIP)) {
    logSecurityEvent({
      type: 'blocked_request',
      ip: clientIP,
      userAgent: req.get('User-Agent'),
      message: 'Request from blocked IP',
      timestamp: new Date(),
      severity: 'high'
    });
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  // Track suspicious activity
  const suspicious = suspiciousIPs.get(clientIP);
  if (suspicious) {
    suspicious.count++;
    suspicious.lastSeen = new Date();

    // Block IP if too many suspicious requests
    if (suspicious.count > 10) {
      blockedIPs.add(clientIP);
      logSecurityEvent({
        type: 'blocked_request',
        ip: clientIP,
        message: `IP blocked due to ${suspicious.count} suspicious requests`,
        timestamp: new Date(),
        severity: 'high'
      });
      res.status(403).json({ error: 'Access denied due to suspicious activity' });
      return;
    }
  }

  next();
};

// Function to mark IP as suspicious
export const markIPSuspicious = (ip: string) => {
  const existing = suspiciousIPs.get(ip);
  if (existing) {
    existing.count++;
    existing.lastSeen = new Date();
  } else {
    suspiciousIPs.set(ip, { count: 1, lastSeen: new Date() });
  }
};

// Cleanup old suspicious IP records (run periodically)
export const cleanupSuspiciousIPs = () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  for (const [ip, data] of suspiciousIPs.entries()) {
    if (data.lastSeen < oneDayAgo) {
      suspiciousIPs.delete(ip);
    }
  }
};

// Cleanup old rate limit logs
export const cleanupRateLimitLogs = () => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [ip, timestamp] of loggedRateLimitIPs.entries()) {
    if (timestamp < oneHourAgo) {
      loggedRateLimitIPs.delete(ip);
    }
  }
};

// Cleanup old message hashes and IP counts
export const cleanupMessageHashes = () => {
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

  // Clean old message hashes (keep for 10 minutes)
  for (const [hash, data] of messageHashes.entries()) {
    if (data.lastSeen < tenMinutesAgo) {
      messageHashes.delete(hash);
    }
  }

  // Clean old IP message counts (keep for 5 minutes)
  for (const [ip, data] of ipMessageCounts.entries()) {
    if (data.lastReset < fiveMinutesAgo) {
      ipMessageCounts.delete(ip);
    }
  }
};

// Run cleanup every hour
setInterval(() => {
  cleanupSuspiciousIPs();
  cleanupRateLimitLogs();
  cleanupMessageHashes();
}, 60 * 60 * 1000);
