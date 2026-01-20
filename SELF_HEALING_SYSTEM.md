# Self-Healing System Documentation

**DialDrill Self-Healing & Resilience Architecture**

This document describes the self-healing mechanisms built into DialDrill to handle issues automatically when scaling to 100+ users, preventing cascading failures and ensuring the app continues operating even when individual services fail.

---

## 🏗️ **Architecture Overview**

The self-healing system consists of multiple layers working together:

1. **Health Monitoring** - Detects issues proactively
2. **Circuit Breakers** - Prevents cascading failures
3. **Automatic Retries** - Recovers from transient failures
4. **Rate Limiting** - Prevents overload
5. **Graceful Degradation** - Continues operating when services fail
6. **Error Tracking** - Logs issues for debugging

---

## 📊 **1. Health Monitoring**

### **Purpose**
Continuously monitors system health and detects issues before they impact users.

### **Implementation**
**File:** `lib/health-monitor.ts`

### **Features**
- Database connection monitoring
- External service health checks (OpenAI, ElevenLabs, Stripe)
- Memory usage tracking
- Error recording and tracking
- Uptime monitoring

### **Usage**
```typescript
import { getHealthMonitor } from '@/lib/health-monitor';

// Get overall health status
const health = await getHealthMonitor().getHealthStatus();
console.log(health.status); // 'healthy' | 'degraded' | 'unhealthy'

// Record an error
getHealthMonitor().recordError('openai', error);
```

### **API Endpoint**
```
GET /api/health              # Quick health check (database only)
GET /api/health?detailed=true # Full health status
```

### **Response Format**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T12:00:00Z",
  "checks": {
    "database": { "status": "up", "responseTime": 45 },
    "openai": { "status": "up" },
    "memory": { "status": "up" }
  },
  "uptime": 3600000,
  "errors": [...]
}
```

---

## 🔌 **2. Circuit Breakers**

### **Purpose**
Automatically stops calling a failing service after repeated failures, allowing it to recover before retrying. Prevents cascading failures.

### **Implementation**
**File:** `lib/circuit-breaker.ts`

### **States**
- **CLOSED** - Normal operation, calls pass through
- **OPEN** - Service is failing, calls are blocked
- **HALF-OPEN** - Testing if service recovered, limited calls allowed

### **Usage**
```typescript
import { getCircuitBreaker } from '@/lib/circuit-breaker';

const circuitBreaker = getCircuitBreaker('openai-coaching', {
  failureThreshold: 5,    // Open after 5 failures
  resetTimeout: 30000,    // Try again after 30 seconds
  halfOpenMaxCalls: 3     // Allow 3 calls in half-open state
});

try {
  const result = await circuitBreaker.execute(() => {
    return callExternalService();
  });
} catch (error) {
  // Circuit is open - service unavailable
}
```

### **Automatic Behavior**
1. After 5 consecutive failures → Circuit opens
2. After 30 seconds → Circuit enters half-open state
3. After successful call → Circuit closes
4. After another failure in half-open → Circuit opens again

---

## 🔄 **3. Automatic Retries**

### **Purpose**
Automatically retries failed operations with exponential backoff, handling transient network issues.

### **Implementation**
**File:** `lib/retry.ts`

### **Features**
- Exponential backoff (delays increase with each retry)
- Configurable max attempts
- Retryable error detection
- Circuit breaker integration

### **Usage**
```typescript
import { retryWithBackoff } from '@/lib/retry';

const result = await retryWithBackoff(
  () => callExternalAPI(),
  {
    maxAttempts: 3,
    initialDelay: 1000,      // Start with 1 second
    maxDelay: 10000,         // Max 10 seconds between retries
    backoffMultiplier: 2,    // Double delay each time
    retryableErrors: [
      { status: 500 },
      { status: 503 },
      { message: 'timeout' }
    ]
  }
);
```

### **Retry Flow**
1. Attempt 1: Immediate
2. Attempt 2: After 1 second
3. Attempt 3: After 2 seconds
4. If all fail: Throw error

### **Integrated with Circuit Breakers**
```typescript
import { retryWithCircuitBreaker } from '@/lib/retry';

// Combines retry + circuit breaker protection
const result = await retryWithCircuitBreaker(
  'openai',
  () => callOpenAI(),
  retryOptions,
  circuitBreakerOptions
);
```

---

## 🚦 **4. Rate Limiting**

### **Purpose**
Prevents API abuse and protects against overload by limiting requests per user/IP.

### **Implementation**
**File:** `lib/rate-limiter.ts`

### **Usage**
```typescript
import { getRateLimiter, RateLimitConfigs, getClientIdentifier } from '@/lib/rate-limiter';

const rateLimiter = getRateLimiter('api-endpoint', RateLimitConfigs.normal);
const clientId = getClientIdentifier(request, userId);
const result = rateLimiter.isAllowed(clientId);

if (!result.allowed) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

### **Configurations**
```typescript
RateLimitConfigs.strict   // 10 requests/minute
RateLimitConfigs.normal   // 100 requests/minute
RateLimitConfigs.loose    // 1000 requests/minute
RateLimitConfigs.hourly   // 1000 requests/hour
```

### **Response Headers**
When rate limited, response includes:
- `Retry-After: 60`
- `X-RateLimit-Limit: 100`
- `X-RateLimit-Remaining: 0`
- `X-RateLimit-Reset: 1234567890`

---

## 🛡️ **5. API Wrapper**

### **Purpose**
Automatically wraps API handlers with error handling, retry, rate limiting, and monitoring.

### **Implementation**
**File:** `lib/api-wrapper.ts`

### **Usage**
```typescript
import { withResilience } from '@/lib/api-wrapper';

export const POST = withResilience(
  async (request: Request) => {
    // Your handler code
    return NextResponse.json({ success: true });
  },
  {
    enableRetry: true,
    enableRateLimit: true,
    rateLimitConfig: RateLimitConfigs.normal,
    enableCircuitBreaker: true,
    circuitBreakerService: 'my-service',
    trackHealth: true
  }
);
```

### **Automatic Features**
- ✅ Rate limiting
- ✅ Automatic retries
- ✅ Circuit breaker protection
- ✅ Error logging to health monitor
- ✅ Standardized error responses

---

## 🔧 **6. Integration Examples**

### **OpenAI API Calls (AI Coaching)**
```typescript
// lib/ai-coach.ts - Already integrated!

// Automatically retries on failures
// Uses circuit breaker to prevent cascading failures
// Gracefully degrades if OpenAI is unavailable
const response = await retryWithCircuitBreaker(
  'openai-coaching',
  () => openai.chat.completions.create({...}),
  retryOptions,
  circuitBreakerOptions
);
```

### **Database Queries**
```typescript
// Automatic retry with health monitoring
try {
  const result = await retryWithBackoff(
    () => pool().query('SELECT ...', [params]),
    {
      maxAttempts: 3,
      initialDelay: 500,
      retryableErrors: [
        { code: 'ECONNRESET' },
        { message: 'connection' }
      ]
    }
  );
} catch (error) {
  getHealthMonitor().recordError('database', error);
  // Handle error gracefully
}
```

### **External Service Calls**
```typescript
// ElevenLabs API calls
const circuitBreaker = getCircuitBreaker('elevenlabs');
const result = await circuitBreaker.execute(() => {
  return elevenlabsApi.call();
});
```

---

## 📈 **7. Monitoring & Debugging**

### **Health Check Endpoint**
```bash
# Quick check
curl https://your-domain.com/api/health

# Detailed status
curl https://your-domain.com/api/health?detailed=true
```

### **Error Logging**
All errors are automatically logged with:
- Timestamp
- Service name
- Error message
- Stack trace (in development)

Access via health monitor:
```typescript
const errors = getHealthMonitor().getRecentErrors(10);
```

### **Circuit Breaker Status**
Check circuit breaker states:
```typescript
const circuitBreaker = getCircuitBreaker('openai-coaching');
console.log(circuitBreaker.getStatus());
// {
//   state: 'closed',
//   failures: 0,
//   serviceName: 'openai-coaching'
// }
```

---

## 🚨 **8. Graceful Degradation**

### **Strategy**
When services fail, the app continues operating with reduced functionality:

### **Examples**

**OpenAI Fails:**
- ✅ Calls still work
- ✅ Scoring still works
- ✅ Voice analytics still works
- ⚠️ AI coaching unavailable (shows message)
- ⚠️ UI shows "AI coaching temporarily unavailable"

**ElevenLabs Fails:**
- ✅ All other features work
- ⚠️ Calls fall back to simulated mode
- ⚠️ UI shows "Using simulated mode"

**Database Fails:**
- ❌ Critical - Most features unavailable
- ✅ Health check detects issue
- ✅ Error logged for debugging
- ✅ Circuit breaker prevents repeated failures

---

## 📊 **9. Status Codes & Responses**

### **Health Status Codes**
- `200` - Healthy or degraded (still operational)
- `503` - Unhealthy (critical services down)

### **Rate Limiting**
- `429` - Too many requests
- Includes `Retry-After` header

### **Circuit Breaker**
- `503` - Service unavailable (circuit open)
- Error message indicates when retry is possible

---

## 🔍 **10. Debugging Workflow**

When issues occur with 100+ users:

1. **Check Health Status**
   ```bash
   curl /api/health?detailed=true
   ```

2. **Review Recent Errors**
   - Check health monitor error log
   - Identify failing service

3. **Check Circuit Breaker States**
   - See which services are in OPEN state
   - Check failure counts

4. **Review Rate Limiting**
   - Check if users are being rate limited
   - Adjust limits if needed

5. **Monitor Recovery**
   - Circuit breakers will automatically retry
   - Check health status periodically

---

## 🎯 **11. Best Practices**

### **Use Circuit Breakers For**
- External API calls (OpenAI, ElevenLabs, Stripe)
- Third-party services
- Any service that can fail independently

### **Use Retries For**
- Network operations
- Database queries (with connection errors)
- Transient failures

### **Use Rate Limiting For**
- User-facing endpoints
- API endpoints
- Expensive operations

### **Monitor Health For**
- All critical services
- Database connections
- Memory usage
- External dependencies

---

## 📝 **12. Configuration**

### **Environment Variables**
```env
# Required for monitoring
DATABASE_URL=...

# Optional - if not set, service is marked as unavailable
OPENAI_API_KEY=...
ELEVENLABS_API_KEY=...
STRIPE_SECRET_KEY=...
```

### **Adjustable Parameters**

**Circuit Breakers:**
- `failureThreshold`: Default 5 failures
- `resetTimeout`: Default 30 seconds
- `halfOpenMaxCalls`: Default 3 calls

**Retries:**
- `maxAttempts`: Default 3
- `initialDelay`: Default 1000ms
- `maxDelay`: Default 10000ms
- `backoffMultiplier`: Default 2

**Rate Limiting:**
- Per-endpoint configuration
- Adjustable in `RateLimitConfigs`

---

## ✅ **13. What's Protected**

### **✅ Currently Protected:**
- ✅ OpenAI API calls (AI Coaching)
- ✅ Database queries (via health monitoring)
- ✅ All API routes (via health monitoring)

### **🔧 Can Be Extended:**
- ElevenLabs API calls
- Stripe API calls
- Any external service
- Any API endpoint

---

## 🚀 **14. Adding Protection to New Services**

### **Step 1: Add Circuit Breaker**
```typescript
const circuitBreaker = getCircuitBreaker('my-service');
const result = await circuitBreaker.execute(() => callService());
```

### **Step 2: Add Retry Logic**
```typescript
const result = await retryWithBackoff(
  () => callService(),
  { maxAttempts: 3, ... }
);
```

### **Step 3: Add Health Monitoring**
```typescript
try {
  const result = await callService();
} catch (error) {
  getHealthMonitor().recordError('my-service', error);
  throw error;
}
```

### **Step 4: Add Graceful Degradation**
```typescript
try {
  const result = await callService();
} catch (error) {
  // Fallback behavior
  return fallbackFunction();
}
```

---

## 📞 **15. Monitoring in Production**

### **Recommended Setup:**
1. **Health Check Monitoring**
   - Set up uptime monitoring (e.g., UptimeRobot) to ping `/api/health`
   - Alert on 503 responses

2. **Error Tracking**
   - Health monitor logs errors
   - Consider integrating with external service (Sentry, LogRocket)

3. **Performance Monitoring**
   - Monitor health check response times
   - Alert on degraded status

4. **Circuit Breaker Alerts**
   - Monitor when circuits open
   - Alert on repeated failures

---

## 🎊 **Summary**

DialDrill now has a **comprehensive self-healing system** that:

✅ **Detects issues** before they impact users  
✅ **Prevents cascading failures** with circuit breakers  
✅ **Automatically retries** transient failures  
✅ **Protects against overload** with rate limiting  
✅ **Continues operating** when services fail  
✅ **Logs all errors** for debugging  
✅ **Provides health status** for monitoring  

**Result:** The app can handle 100+ users gracefully, automatically recovering from failures without collapsing! 🚀

---

## 📚 **File Reference**

- `lib/health-monitor.ts` - Health monitoring
- `lib/circuit-breaker.ts` - Circuit breaker pattern
- `lib/retry.ts` - Automatic retries
- `lib/rate-limiter.ts` - Rate limiting
- `lib/api-wrapper.ts` - API handler wrapper
- `app/api/health/route.ts` - Health check endpoint


