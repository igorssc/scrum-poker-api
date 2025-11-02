# WebSocket Troubleshooting Guide for Fly.io

## Common Issues and Solutions

### 1. WebSocket not working in production (Fly.io)

**Symptoms:**
- WebSocket works locally but fails in Fly.io
- Clients can't connect to WebSocket
- No WebSocket events are fired

**Solutions Applied:**

#### A. Transport Configuration
```typescript
// Added polling fallback
transports: ['websocket', 'polling']
```

#### B. CORS Configuration
```typescript
cors: { 
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://scrumpoker.dev.br'] 
    : '*',
  credentials: true 
}
```

#### C. Server Binding
```typescript
// Bind to 0.0.0.0 instead of localhost
await app.listen(PORT, '0.0.0.0')
```

#### D. Timeouts and Intervals
```typescript
pingTimeout: 60000,    // Increased from 30000
pingInterval: 25000,   // Added explicit interval
```

### 2. Fly.io Specific Configuration

#### fly.toml
```toml
[http_service]
  internal_port = 8080
  force_https = true
  
[http_service.concurrency]
  type = "connections"
  hard_limit = 1000
  soft_limit = 800
```

### 3. Environment Variables

Make sure these are set in Fly.io:

```bash
fly secrets set NODE_ENV=production
fly secrets set POSTGRES_URL="your-production-db-url"
fly secrets set FRONTEND_URL="https://scrumpoker.dev.br"
```

### 4. Health Check

Access `/health` endpoint to verify the server is running:
```json
{
  "status": "ok",
  "timestamp": "2025-11-02T...",
  "environment": "production",
  "websocket": "enabled"
}
```

### 5. Client-Side Debugging

Add this to your frontend WebSocket connection:

```javascript
const socket = io('wss://your-api-domain.fly.dev', {
  transports: ['websocket', 'polling'],
  upgrade: true,
  rememberUpgrade: true,
  timeout: 20000,
});

socket.on('connect', () => {
  console.log('Connected with transport:', socket.io.engine.transport.name);
});

socket.on('server-info', (info) => {
  console.log('Server info:', info);
});

socket.on('connection-success', (data) => {
  console.log('Connection success:', data);
});
```

### 6. Deployment Commands

```bash
# Deploy with proper environment
fly deploy

# Check logs
fly logs

# SSH into container for debugging
fly ssh console
```

### 7. Common Fixes

1. **Protocol Mismatch**: Ensure you're using `wss://` for HTTPS sites
2. **Port Issues**: Use the correct port (usually 443 for WSS)
3. **Network Policies**: Check if Fly.io regions have any restrictions
4. **Sticky Sessions**: May be needed for scaling beyond 1 instance

### 8. Debug Logs

The server now logs detailed WebSocket information:
- Transport type used (websocket/polling)
- Client connections and disconnections
- Transport upgrades
- Server environment info