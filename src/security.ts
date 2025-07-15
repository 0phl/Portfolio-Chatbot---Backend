import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import winston from 'winston';
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
    // Prompt injection patterns (enhanced)
    /ignore\s+(previous|above|all|prior)\s+(instructions?|prompts?|rules?|commands?)/i,
    /forget\s+(everything|all|previous|prior)/i,
    /you\s+are\s+now\s+a?\s*(different|new)/i,
    /system\s*:\s*/i,
    /assistant\s*:\s*/i,
    /human\s*:\s*/i,
    /tell\s+me\s+(your|the)\s+system\s+prompt/i,
    /what\s+(is|are)\s+(your|the)\s+(system\s+)?(prompt|instructions)/i,
    /override\s+(previous|all)\s+(instructions?|commands?)/i,
    /disregard\s+(previous|all|above)/i,
    /<\s*script\s*>/i,
    /javascript\s*:/i,
    /data\s*:\s*text\/html/i,
    /eval\s*\(/i,
    /function\s*\(/i,
    // SQL injection patterns
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    // XSS patterns
    /<\s*iframe/i,
    /<\s*object/i,
    /<\s*embed/i,
    /on\w+\s*=/i,
    // Excessive repetition (potential spam)
    /(.)\1{50,}/,
    // Extremely long words (potential buffer overflow attempts)
    /\w{200,}/
  ]
};

// Optional security controls
export const securityControls = {
  enableIPBlocking: process.env.ENABLE_IP_BLOCKING === 'true',
  enableSuspiciousPatternDetection: process.env.ENABLE_SUSPICIOUS_PATTERN_DETECTION !== 'false', // Default true
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Security logger
export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'portfolio-chatbot-security' },
  transports: [
    new winston.transports.File({ filename: 'logs/security-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/security-combined.log' }),
    ...(process.env.NODE_ENV !== 'production' ? [new winston.transports.Console({
      format: winston.format.simple()
    })] : [])
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

// Per-message rate limiter for chat (prevents spam of same content)
const messageHashes = new Map<string, { count: number, lastSeen: number }>();

export const perMessageRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const { message } = req.body;
  if (!message) return next();

  // Create hash of message content
  const messageHash = message.toLowerCase().trim().substring(0, 100);
  const now = Date.now();
  const existing = messageHashes.get(messageHash);

  if (existing) {
    // If same message sent within 30 seconds, block it
    if (now - existing.lastSeen < 30000) {
      existing.count++;
      if (existing.count > 3) {
        res.status(429).json({
          error: 'Please wait before sending the same message again.'
        });
        return;
      }
    } else {
      // Reset count if enough time has passed
      existing.count = 1;
    }
    existing.lastSeen = now;
  } else {
    messageHashes.set(messageHash, { count: 1, lastSeen: now });
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

// Cleanup old message hashes
export const cleanupMessageHashes = () => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [hash, data] of messageHashes.entries()) {
    if (data.lastSeen < fiveMinutesAgo) {
      messageHashes.delete(hash);
    }
  }
};

// Run cleanup every hour
setInterval(() => {
  cleanupSuspiciousIPs();
  cleanupRateLimitLogs();
  cleanupMessageHashes();
}, 60 * 60 * 1000);
