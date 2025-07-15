# Security Implementation Guide

This document outlines the comprehensive security measures implemented in the Portfolio Chatbot API to protect against common vulnerabilities and attacks.

## 🛡️ Security Features Implemented

### 1. Input Validation & Sanitization

**Protection Against:**
- Prompt injection attacks
- XSS (Cross-Site Scripting)
- SQL injection attempts
- Buffer overflow attempts
- Malicious script execution

**Implementation:**
- Message length limits (configurable, default: 1000 characters)
- Suspicious pattern detection using regex patterns
- HTML escaping and input sanitization
- Whitespace normalization
- Content filtering for malicious payloads

**Configuration:**
```env
MAX_MESSAGE_LENGTH=1000
```

### 2. Rate Limiting & DoS Protection

**Protection Against:**
- Denial of Service (DoS) attacks
- API abuse and quota exhaustion
- Brute force attacks
- Resource exhaustion

**Implementation:**
- **Chat Endpoint**: 10 requests per minute per IP
- **General API**: 100 requests per hour per IP
- Progressive slow-down after threshold
- Automatic IP blocking for repeated violations

**Configuration:**
```env
MAX_REQUESTS_PER_MINUTE=10
MAX_REQUESTS_PER_HOUR=100
SLOW_DOWN_THRESHOLD=5
```

### 3. Enhanced CORS Security

**Protection Against:**
- Cross-origin attacks
- Unauthorized domain access
- CSRF (Cross-Site Request Forgery)

**Implementation:**
- Whitelist-based origin validation
- Configurable allowed origins
- Proper credentials handling
- Secure headers configuration

**Configuration:**
```env
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### 4. Security Headers

**Protection Against:**
- Clickjacking
- MIME type sniffing
- XSS attacks
- Content injection

**Implementation:**
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (HSTS)
- X-XSS-Protection

### 5. Comprehensive Logging & Monitoring

**Features:**
- Security event logging
- Request/response monitoring
- Error tracking with unique IDs
- IP-based activity tracking
- Suspicious behavior detection

**Log Files:**
- `logs/security-error.log` - Security-related errors
- `logs/security-combined.log` - All security events

### 6. IP Protection System

**Features:**
- Automatic IP blocking for malicious behavior
- Suspicious activity tracking
- Temporary and permanent blocking
- Automatic cleanup of old records

## 🔧 Configuration

### Environment Variables

```env
# Security Configuration
MAX_MESSAGE_LENGTH=1000          # Maximum message length
MAX_REQUESTS_PER_MINUTE=10       # Rate limit per minute
MAX_REQUESTS_PER_HOUR=100        # Rate limit per hour
SLOW_DOWN_THRESHOLD=5            # Requests before slow-down
ALLOWED_ORIGINS=domain1,domain2  # Comma-separated allowed origins
```

### Security Patterns

The system automatically detects and blocks:

- **Prompt Injection**: "ignore previous instructions", "you are now a different"
- **Script Injection**: `<script>`, `javascript:`, `eval(`
- **SQL Injection**: `union select`, `drop table`, `delete from`
- **XSS Attempts**: `<iframe>`, `<object>`, `on*=` attributes
- **Buffer Overflow**: Extremely long words or repeated characters

## 📊 Monitoring & Alerts

### Security Events Tracked

1. **Rate Limit Violations**
   - IP address and timestamp
   - Request frequency analysis
   - Automatic blocking triggers

2. **Suspicious Input Detection**
   - Pattern matching results
   - Input content analysis
   - User agent tracking

3. **Blocked Requests**
   - Origin validation failures
   - IP-based blocks
   - CORS violations

4. **Validation Errors**
   - Input format violations
   - Length limit breaches
   - Type validation failures

### Log Analysis

```bash
# View recent security events
tail -f logs/security-combined.log

# Search for specific IP
grep "192.168.1.1" logs/security-combined.log

# Monitor rate limit violations
grep "rate_limit" logs/security-combined.log
```

## 🚨 Incident Response

### Automatic Responses

1. **Rate Limit Exceeded**
   - Temporary request blocking
   - Progressive delays
   - Error response with retry information

2. **Suspicious Input Detected**
   - Request rejection
   - IP marking for monitoring
   - Security event logging

3. **Repeated Violations**
   - IP address blocking
   - Extended rate limiting
   - Alert generation

### Manual Intervention

```javascript
// Unblock an IP address (if needed)
// Add to your admin script
const { markIPSuspicious } = require('./src/security');

// Clear suspicious IP records
// (Automatic cleanup runs every hour)
```

## 🔒 Best Practices

### For Deployment

1. **Environment Variables**
   - Use strong, unique API keys
   - Set appropriate rate limits for your use case
   - Configure allowed origins for production domains

2. **Monitoring**
   - Set up log rotation
   - Monitor security logs regularly
   - Set up alerts for high-severity events

3. **Updates**
   - Keep dependencies updated
   - Review security patterns regularly
   - Monitor for new attack vectors

### For Development

1. **Testing**
   - Test rate limiting with multiple requests
   - Verify CORS configuration
   - Test input validation with edge cases

2. **Logging**
   - Check log files for security events
   - Verify proper error handling
   - Test IP blocking functionality

## 📈 Performance Impact

The security measures are designed to have minimal performance impact:

- **Rate Limiting**: In-memory storage, O(1) operations
- **Pattern Matching**: Optimized regex patterns
- **Logging**: Asynchronous, non-blocking
- **IP Tracking**: Automatic cleanup prevents memory leaks

## 🔄 Maintenance

### Regular Tasks

1. **Log Rotation** (Weekly)
   ```bash
   # Rotate security logs
   mv logs/security-combined.log logs/security-combined.log.$(date +%Y%m%d)
   touch logs/security-combined.log
   ```

2. **Security Review** (Monthly)
   - Review blocked IPs
   - Analyze attack patterns
   - Update security patterns if needed

3. **Dependency Updates** (Monthly)
   ```bash
   npm audit
   npm update
   ```

## 🆘 Troubleshooting

### Common Issues

1. **Legitimate Users Blocked**
   - Check rate limit settings
   - Review IP blocking logs
   - Adjust thresholds if needed

2. **CORS Errors**
   - Verify ALLOWED_ORIGINS configuration
   - Check frontend domain spelling
   - Ensure protocol (http/https) matches

3. **False Positive Pattern Detection**
   - Review suspicious patterns
   - Adjust regex patterns if needed
   - Add exceptions for legitimate use cases

### Debug Mode

Set `NODE_ENV=development` to enable:
- Console logging of security events
- Detailed error messages
- Request/response logging

## 📞 Support

For security-related issues:
1. Check the logs first: `logs/security-combined.log`
2. Review this documentation
3. Test with minimal configuration
4. Report persistent issues with log excerpts

---

**Remember**: Security is an ongoing process. Regularly review and update these measures based on new threats and usage patterns.
