# Backend Services Architecture Plan

## Overview

This document outlines the planned backend services architecture for GoInvestMe, following 12 Factor App methodology and modern microservices principles.

**Status**: 📋 **PLANNING PHASE** - Implementation pending

---

## Current Architecture

### What We Have ✅
- **Frontend**: Next.js application on Vercel
- **Smart Contracts**: Deployed on Ethereum (Sepolia testnet)
- **Web3 Integration**: Direct blockchain interaction via wagmi/viem
- **Configuration**: Externalized environment variables
- **Logging**: Winston structured logging
- **Error Tracking**: Sentry integration
- **Health Checks**: API endpoints for monitoring
- **CI/CD**: GitHub Actions with automated deployment

### What's Missing ⚠️
- **Backend API**: No dedicated backend service
- **Database**: No persistent storage layer
- **Caching**: No Redis or similar caching
- **Message Queue**: No async job processing
- **Admin Tools**: No admin processes infrastructure

---

## Proposed Architecture

### High-Level Design

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[Mobile App]
    end
    
    subgraph "Edge Layer - Vercel"
        C[Next.js Frontend]
        D[API Routes]
    end
    
    subgraph "Backend Services"
        E[API Gateway]
        F[Auth Service]
        G[Analytics Service]
        H[Notification Service]
        I[Indexer Service]
    end
    
    subgraph "Data Layer"
        J[PostgreSQL]
        K[Redis Cache]
        L[S3 Storage]
    end
    
    subgraph "Blockchain"
        M[Ethereum RPC]
        N[Smart Contracts]
    end
    
    subgraph "External Services"
        O[Sentry]
        P[Email Provider]
        Q[SMS Provider]
    end
    
    A --> C
    B --> C
    C --> D
    D --> E
    E --> F
    E --> G
    E --> H
    E --> I
    F --> J
    G --> J
    H --> K
    I --> M
    M --> N
    G --> O
    H --> P
    H --> Q
    I --> J
```

---

## Backend Services Breakdown

### 1. API Gateway

**Purpose**: Central entry point for all backend requests

**Responsibilities**:
- Request routing
- Rate limiting
- Authentication/Authorization
- Request logging
- Response caching
- API versioning

**Technology Stack**:
- Node.js + Express/Fastify
- Or: Kong/Tyk API Gateway
- Or: AWS API Gateway

**12 Factor Compliance**:
- ✅ Stateless (no session storage)
- ✅ Port binding (configurable port)
- ✅ Concurrent processes
- ✅ Configuration via environment

### 2. Authentication Service

**Purpose**: User authentication and authorization

**Responsibilities**:
- Wallet signature verification
- JWT token generation
- Session management (Redis)
- Role-based access control (RBAC)
- OAuth integration (future)

**Technology Stack**:
- Node.js + Passport.js
- Redis for session storage
- PostgreSQL for user data

**Endpoints**:
```
POST   /auth/nonce              # Get nonce for signing
POST   /auth/verify             # Verify signature
POST   /auth/refresh            # Refresh token
POST   /auth/logout             # Logout
GET    /auth/me                 # Get current user
```

**12 Factor Compliance**:
- ✅ Stateless (sessions in Redis, not memory)
- ✅ Backing service (Redis as attached resource)
- ✅ Configuration via environment

### 3. Analytics Service

**Purpose**: Track and analyze user behavior

**Responsibilities**:
- Event tracking
- User analytics
- Transaction metrics
- Dashboard data aggregation
- Report generation

**Technology Stack**:
- Node.js + PostgreSQL
- ClickHouse for time-series data
- Redis for real-time counters

**Events to Track**:
- Wallet connections
- Coin creations
- Purchases
- Page views
- User actions

**12 Factor Compliance**:
- ✅ Logs as event streams
- ✅ Background jobs (cron processes)
- ✅ Stateless processing

### 4. Notification Service

**Purpose**: Send notifications to users

**Responsibilities**:
- Email notifications
- SMS notifications (future)
- Push notifications (future)
- In-app notifications
- Notification preferences

**Technology Stack**:
- Node.js + Bull (job queue)
- Redis for queue
- SendGrid/Mailgun for email
- Twilio for SMS

**Notification Types**:
- Transaction confirmations
- Investment updates
- System alerts
- Marketing emails

**12 Factor Compliance**:
- ✅ Backing services (email as attached resource)
- ✅ Admin processes (job workers)
- ✅ Concurrency (multiple workers)

### 5. Blockchain Indexer Service

**Purpose**: Index and cache blockchain data

**Responsibilities**:
- Listen to smart contract events
- Index transaction history
- Cache blockchain data
- Sync with Ethereum
- Provide fast queries

**Technology Stack**:
- Node.js + ethers.js
- PostgreSQL for indexed data
- Redis for caching
- Event sourcing pattern

**Indexed Data**:
- All coin creations
- All purchases
- User balances
- Transaction history
- Cap table data

**12 Factor Compliance**:
- ✅ Backing service (Ethereum as attached resource)
- ✅ Admin processes (indexing workers)
- ✅ Disposability (can restart and re-sync)

---

## Data Layer

### PostgreSQL Database

**Schema Design**:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Coins table (cached from blockchain)
CREATE TABLE coins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id BIGINT UNIQUE NOT NULL,
  entrepreneur_address VARCHAR(42) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website VARCHAR(500),
  total_supply NUMERIC NOT NULL,
  price_per_coin NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  block_number BIGINT NOT NULL,
  transaction_hash VARCHAR(66) NOT NULL
);

-- Purchases table (indexed from blockchain)
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coin_id UUID REFERENCES coins(id),
  buyer_address VARCHAR(42) NOT NULL,
  amount NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  block_number BIGINT NOT NULL,
  transaction_hash VARCHAR(66) NOT NULL
);

-- Events table (event sourcing)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Analytics events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_name VARCHAR(100) NOT NULL,
  properties JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_coins_entrepreneur ON coins(entrepreneur_address);
CREATE INDEX idx_purchases_buyer ON purchases(buyer_address);
CREATE INDEX idx_purchases_coin ON purchases(coin_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_created ON events(created_at);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_event ON analytics_events(event_name);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);
```

**12 Factor Compliance**:
- ✅ Backing service (attached via DATABASE_URL)
- ✅ Disposability (can reconnect)
- ✅ Configuration (connection via env var)

### Redis Cache

**Use Cases**:
- Session storage
- API response caching
- Rate limiting counters
- Real-time leaderboards
- Job queue (Bull)

**Schema**:
```
sessions:{sessionId}          # User sessions (TTL: 24h)
cache:coin:{id}               # Coin data cache (TTL: 5m)
cache:user:{address}          # User data cache (TTL: 5m)
ratelimit:{ip}:{endpoint}     # Rate limits (TTL: 1m)
queue:notifications           # Notification queue
```

**12 Factor Compliance**:
- ✅ Backing service (attached via REDIS_URL)
- ✅ Disposability (ephemeral data)
- ✅ Configuration (connection via env var)

### S3 Storage

**Use Cases**:
- User profile images
- Coin logos
- Documentation files
- Export files
- Backup files

**12 Factor Compliance**:
- ✅ Backing service (attached via S3 credentials)
- ✅ Stateless (no local file storage)

---

## Deployment Architecture

### Container Strategy

**Each service as a separate container**:

```dockerfile
# Example: API Gateway Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

**Docker Compose (Development)**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: goinvestme
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
  
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "3001:3001"
    environment:
      PORT: 3001
      DATABASE_URL: postgresql://dev:devpass@postgres:5432/goinvestme
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  auth-service:
    build: ./services/auth
    ports:
      - "3002:3002"
    environment:
      PORT: 3002
      DATABASE_URL: postgresql://dev:devpass@postgres:5432/goinvestme
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  indexer-service:
    build: ./services/indexer
    environment:
      DATABASE_URL: postgresql://dev:devpass@postgres:5432/goinvestme
      ETHEREUM_RPC_URL: https://sepolia.infura.io/v3/${INFURA_KEY}
    depends_on:
      - postgres

volumes:
  postgres_data:
  redis_data:
```

---

## API Design

### RESTful API Structure

**Base URL**: `https://api.goinvestme.com/v1`

**Endpoints**:

```
# Auth
POST   /auth/nonce
POST   /auth/verify
POST   /auth/refresh
GET    /auth/me

# Coins
GET    /coins                    # List all coins (paginated)
GET    /coins/:id                # Get coin details
GET    /coins/:id/purchases      # Get coin purchase history
GET    /coins/:id/holders        # Get coin holders
POST   /coins                    # Create coin (proxies to blockchain)

# Users
GET    /users/:address           # Get user profile
GET    /users/:address/coins     # Get user's coins
GET    /users/:address/purchases # Get user's purchases
PATCH  /users/:address           # Update user profile

# Analytics
GET    /analytics/overview       # Platform overview
GET    /analytics/coins/:id      # Coin analytics
GET    /analytics/users/:address # User analytics

# Notifications
GET    /notifications            # Get user notifications
PATCH  /notifications/:id/read   # Mark as read
POST   /notifications/subscribe  # Subscribe to updates
```

**Response Format**:
```json
{
  "success": true,
  "data": {...},
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 100
  }
}
```

**Error Format**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Signature verification failed",
    "details": {...}
  }
}
```

---

## Environment Configuration

### Required Environment Variables

**All Services**:
```bash
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
SENTRY_DSN=https://...
```

**Services with Database**:
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_POOL_SIZE=20
```

**Services with Redis**:
```bash
REDIS_URL=redis://host:6379
REDIS_TLS=true
```

**Indexer Service**:
```bash
ETHEREUM_RPC_URL=https://...
SEPOLIA_CONTRACT_ADDRESS=0x...
SYNC_FROM_BLOCK=0
```

**Notification Service**:
```bash
SENDGRID_API_KEY=SG...
FROM_EMAIL=noreply@goinvestme.com
```

---

## Scalability Strategy

### Horizontal Scaling

**API Gateway**: Load balanced, multiple instances
**Auth Service**: Stateless, can scale infinitely
**Analytics Service**: Read replicas for queries
**Notification Service**: Multiple workers
**Indexer Service**: Single instance (event sourcing)

### Caching Strategy

**Level 1**: In-memory cache (Node.js)
**Level 2**: Redis cache
**Level 3**: CDN (CloudFront/Vercel Edge)

### Database Scaling

**Read Replicas**: For analytics queries
**Connection Pooling**: PgBouncer
**Partitioning**: Time-based partitioning for events

---

## Monitoring & Observability

### Metrics to Track

**Application Metrics**:
- Request rate
- Response time
- Error rate
- Active connections

**Business Metrics**:
- Coins created per day  
- Total investment volume
- Active users
- Retention rate

**Infrastructure Metrics**:
- CPU usage
- Memory usage
- Database connections
- Cache hit rate

### Tools

- **APM**: Sentry Performance
- **Logging**: Winston → CloudWatch/Datadog
- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry
- **Alerts**: PagerDuty

---

## Security Considerations

### Authentication
- Wallet signature verification
- JWT with short expiration
- Refresh token rotation
- Rate limiting per user

### Authorization
- Role-based access control
- Resource-based permissions
- API key authentication (for services)

### Data Protection
- Encrypt sensitive data at rest
- HTTPS only
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection

---

## Migration Strategy

### Phase 1: Infrastructure Setup (Week 1-2)
- [ ] Set up AWS/DO account
- [ ] Configure PostgreSQL (RDS/Managed)
- [ ] Configure Redis (ElastiCache/Managed)
- [ ] Set up S3 bucket
- [ ] Configure monitoring

### Phase 2: Core Services (Week 3-4)
- [ ] Build API Gateway
- [ ] Build Auth Service
- [ ] Migrate Next.js API routes to backend
- [ ] Integration testing

### Phase 3: Data Services (Week 5-6)
- [ ] Build Indexer Service
- [ ] Historical data migration
- [ ] Real-time event listening
- [ ] Performance testing

### Phase 4: Enhanced Services (Week 7-8)
- [ ] Build Analytics Service
- [ ] Build Notification Service
- [ ] Admin dashboard
- [ ] Load testing

### Phase 5: Production (Week 9-10)
- [ ] Gradual rollout
- [ ] Monitoring and optimization
- [ ] Documentation
- [ ] Team training

---

## Cost Estimation

### Infrastructure (Monthly)

| Service | Provider | Cost |
|---------|----------|------|
| PostgreSQL | AWS RDS (t3.micro) | $15 |
| Redis | AWS ElastiCache | $15 |
| S3 Storage | AWS S3 | $5 |
| API Services | Vercel/Railway | $20 |
| Monitoring | Sentry/Datadog | $30 |
| **Total** | - | **~$85/mo** |

### Scaling Cost

| Level | Users | Infra Cost |
|-------|-------|------------|
| MVP | < 1K | $85/mo |
| Growth | 1K-10K | $200/mo |
| Scale | 10K-100K | $500/mo |

---

## 12 Factor Compliance

### How Backend Services Complete Compliance

| Factor | Current | With Backend | Improvement |
|--------|---------|--------------|-------------|
| IV. Backing Services | 6/10 | 10/10 | +4 points |
| VI. Processes | 6/10 | 9/10 | +3 points |
| VIII. Concurrency | 5/10 | 9/10 | +4 points |
| XII. Admin Processes | 6/10 | 9/10 | +3 points |

**Projected Overall Score**: 8.1/10 → 9.3/10 (+1.2 points)

---

## Conclusion

This backend architecture plan provides a scalable, maintainable foundation for GoInvestMe's growth. By following 12 Factor methodology and modern best practices, we ensure:

- ✅ Easy scaling
- ✅ Simple deployment
- ✅ Clear separation of concerns
- ✅ Production-ready infrastructure

**Next Steps**: Begin Phase 1 (Infrastructure Setup) when ready to implement.

---

## References

- [12 Factor App](https://12factor.net/)
- [Microservices Patterns](https://microservices.io/)
- [API Design Best Practices](https://www.oreilly.com/library/view/api-design-patterns/9781617295850/)
- [Ethereum Event Indexing](https://www.quicknode.com/guides/ethereum-development/smart-contracts/how-to-index-smart-contract-events)
