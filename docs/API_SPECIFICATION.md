# LaunchPad API Specification

**Version**: 1.0  
**Date**: January 30, 2026  
**Base URL**: `https://api.launchpad.com/v1`  
**Format**: REST + JSON

---

## Authentication

All API requests (except auth endpoints) require authentication via JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

### Wallet Authentication Flow

```typescript
// 1. Request challenge
POST /auth/challenge
Body: { walletAddress: "0x..." }
Response: { challenge: "Sign this message: 0x1234..." }

// 2. Sign challenge with wallet
// (User signs in MetaMask/wallet)

// 3. Verify signature
POST /auth/verify
Body: { 
  walletAddress: "0x...",
  signature: "0x...",
  challenge: "0x1234..."
}
Response: {
  token: "eyJhbGc...",
  user: { _id, email, userType, ... }
}
```

---

## API Endpoints

### 1. Authentication

#### POST /auth/challenge
Request a signing challenge for wallet authentication.

**Request:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response:**
```json
{
  "challenge": "Sign this message to authenticate: 0x1a2b3c...",
  "expiresAt": "2026-01-30T22:00:00Z"
}
```

---

#### POST /auth/verify
Verify signed challenge and receive JWT.

**Request:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0xabc123...",
  "challenge": "0x1a2b3c..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65abc123...",
    "email": "user@example.com",
    "walletAddress": "0x742d35Cc...",
    "userType": "investor",
    "kycStatus": "approved",
    "accreditationStatus": "accredited"
  },
  "expiresAt": "2026-01-31T21:00:00Z"
}
```

---

#### POST /auth/refresh
Refresh an expiring JWT token.

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "token": "new_jwt_token",
  "expiresAt": "2026-01-31T22:00:00Z"
}
```

---

### 2. User Management

#### GET /users/me
Get current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "_id": "65abc123",
  "email": "investor@example.com",
  "walletAddress": "0x742d35Cc...",
  "userType": "investor",
  "firstName": "John",
  "lastName": "Doe",
  "kycStatus": "approved",
  "accreditationStatus": "accredited",
  "accreditationExpiresAt": "2027-01-30T00:00:00Z",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

---

#### PATCH /users/me
Update current user's profile.

**Request:**
```json
{
  "firstName": "Jane",
  "bio": "Experienced angel investor",
  "linkedinUrl": "linkedin.com/in/janedoe"
}
```

**Response:**
```json
{
  "_id": "65abc123",
  "firstName": "Jane",
  "bio": "Experienced angel investor",
  "linkedinUrl": "linkedin.com/in/janedoe",
  "updatedAt": "2026-01-30T21:00:00Z"
}
```

---

#### POST /users/upload-avatar
Upload user profile image.

**Request:** `multipart/form-data`
```
avatar: <file>
```

**Response:**
```json
{
  "profileImageUrl": "https://cdn.launchpad.com/avatars/65abc123.jpg",
  "updatedAt": "2026-01-30T21:05:00Z"
}
```

---

### 3. KYC/KYB

#### POST /kyc/initiate
Start KYC verification process.

**Request:**
```json
{
  "userType": "investor",
  "includeAccreditation": true
}
```

**Response:**
```json
{
  "inquiryId": "inq_abc123",
  "provider": "persona",
  "url": "https://withpersona.com/verify?inquiry-id=inq_abc123",
  "status": "pending"
}
```

---

#### GET /kyc/status
Check KYC verification status.

**Response:**
```json
{
  "kycStatus": "approved",
  "kycProvider": "persona",
  "kycCompletedAt": "2026-01-15T10:30:00Z",
  "kycExpiresAt": "2027-01-15T10:30:00Z",
  "accreditationStatus": "accredited",
  "accreditationVerifiedAt": "2026-01-15T10:35:00Z"
}
```

---

#### POST /kyc/webhook
**Internal endpoint** - Receives webhooks from Persona.

**Request:**
```json
{
  "type": "inquiry.completed",
  "data": {
    "id": "inq_abc123",
    "type": "inquiry",
    "attributes": {
      "status": "completed",
      "reference-id": "65abc123",
      ...
    }
  }
}
```

**Response:**
```json
{
  "received": true
}
```

---

### 4. Startups

#### POST /startups
Create a new startup profile (founders only).

**Request:**
```json
{
  "companyName": "TechCo Inc",
  "industry": "FinTech",
  "stage": "mvp",
  "description": "AI-powered financial planning",
  "pitch": "We're revolutionizing personal finance...",
  "websiteUrl": "https://techco.com",
  "foundedDate": "2025-06-01"
}
```

**Response:**
```json
{
  "_id": "startup123",
  "slug": "techco-inc",
  "companyName": "TechCo Inc",
  "founderUserId": "65abc123",
  "kybStatus": "pending",
  "createdAt": "2026-01-30T21:10:00Z"
}
```

---

#### GET /startups
List all startups (public, with filters).

**Query Parameters:**
- `industry` (optional): Filter by industry
- `stage` (optional): Filter by stage
- `kybStatus` (optional): Filter by KYB status (default: approved)
- `limit` (default: 20, max: 100)
- `offset` (default: 0)
- `sort` (default: `-createdAt`, options: `createdAt`, `-totalRaised`)

**Response:**
```json
{
  "startups": [
    {
      "_id": "startup123",
      "slug": "techco-inc",
      "companyName": "TechCo Inc",
      "logoUrl": "https://cdn.launchpad.com/logos/techco.png",
      "industry": "FinTech",
      "stage": "mvp",
      "description": "AI-powered financial planning",
      "totalRaised": 500000,
      "activeSafeRounds": 1,
      "featured": false
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

---

#### GET /startups/:slug
Get detailed startup information.

**Response:**
```json
{
  "_id": "startup123",
  "slug": "techco-inc",
  "companyName": "TechCo Inc",
  "logoUrl": "https://cdn.launchpad.com/logos/techco.png",
  "websiteUrl": "https://techco.com",
  "industry": "FinTech",
  "stage": "mvp",
  "description": "AI-powered financial planning",
  "pitch": "Full pitch text...",
  "foundedDate": "2025-06-01",
  "teamSize": 5,
  "teamMembers": [
    { "name": "Alice Smith", "role": "CEO", "linkedinUrl": "..." }
  ],
  "kybStatus": "approved",
  "totalRaised": 500000,
  "safeRounds": [
    {
      "_id": "round123",
      "roundName": "Pre-Seed",
      "status": "active",
      "totalInvested": 250000,
      "maximumRaise": 1000000
    }
  ],
  "views": 1234,
  "investorInterests": 56
}
```

---

#### PATCH /startups/:id
Update startup profile (founder only).

**Request:**
```json
{
  "description": "Updated AI-powered financial planning platform",
  "teamSize": 7
}
```

**Response:**
```json
{
  "_id": "startup123",
  "description": "Updated AI-powered financial planning platform",
  "teamSize": 7,
  "updatedAt": "2026-01-30T21:15:00Z"
}
```

---

### 5. SAFE Rounds

#### POST /startups/:startupId/safe-rounds
Create a new SAFE fundraising round (founder only).

**Request:**
```json
{
  "roundName": "Pre-Seed A",
  "valuationCap": 10000000,
  "discountRate": 20,
  "proRata": true,
  "minimumRaise": 100000,
  "maximumRaise": 1000000,
  "minimumInvestment": 1000,
  "startDate": "2026-02-01T00:00:00Z",
  "endDate": "2026-05-01T23:59:59Z"
}
```

**Response:**
```json
{
  "_id": "round123",
  "startupId": "startup123",
  "roundName": "Pre-Seed A",
  "valuationCap": 10000000,
  "status": "draft",
  "createdAt": "2026-01-30T21:20:00Z"
}
```

---

#### POST /safe-rounds/:id/deploy
Deploy SAFE round to blockchain (founder only).

**Response:**
```json
{
  "_id": "round123",
  "status": "active",
  "contractAddress": "0x1234567890abcdef...",
  "tokenSymbol": "TECHCO-SAFE",
  "deploymentTxHash": "0xabcdef...",
  "deployedAt": "2026-01-30T21:25:00Z"
}
```

---

#### GET /safe-rounds/:id
Get SAFE round details.

**Response:**
```json
{
  "_id": "round123",
  "startupId": "startup123",
  "startup": {
    "companyName": "TechCo Inc",
    "slug": "techco-inc",
    "logoUrl": "..."
  },
  "roundName": "Pre-Seed A",
  "valuationCap": 10000000,
  "discountRate": 20,
  "minimumInvestment": 1000,
  "maximumRaise": 1000000,
  "totalInvested": 250000,
  "investorCount": 25,
  "status": "active",
  "contractAddress": "0x1234...",
  "endDate": "2026-05-01T23:59:59Z",
  "daysRemaining": 91
}
```

---

### 6. Investments

#### POST /investments
Create an investment (investor only).

**Request:**
```json
{
  "safeRoundId": "round123",
  "amountUSD": 5000,
  "transactionHash": "0xabc123...",
  "amountETH": 1.5,
  "ethToUsdRate": 3333.33
}
```

**Response:**
```json
{
  "_id": "inv123",
  "investorUserId": "65abc123",
  "safeRoundId": "round123",
  "startupId": "startup123",
  "amountUSD": 5000,
  "amountETH": 1.5,
  "tokensReceived": 5000,
  "transactionHash": "0xabc123...",
  "status": "pending",
  "platformFee": 100,
  "createdAt": "2026-01-30T21:30:00Z"
}
```

---

#### GET /investments
Get current user's investments (portfolio).

**Query Parameters:**
- `status` (optional): Filter by status
- `limit` (default: 50)
- `offset` (default: 0)

**Response:**
```json
{
  "investments": [
    {
      "_id": "inv123",
      "startup": {
        "companyName": "TechCo Inc",
        "logoUrl": "...",
        "slug": "techco-inc"
      },
      "safeRound": {
        "roundName": "Pre-Seed A"
      },
      "amountUSD": 5000,
      "tokensReceived": 5000,
      "investedAt": "2026-01-30T21:30:00Z",
      "status": "confirmed",
      "currentValue": 5000
    }
  ],
  "totalInvested": 25000,
  "portfolioCount": 5
}
```

---

#### GET /investments/:id
Get investment details.

**Response:**
```json
{
  "_id": "inv123",
  "investorUserId": "65abc123",
  "startup": { ... },
  "safeRound": { ... },
  "amountUSD": 5000,
  "amountETH": 1.5,
  "ethToUsdRate": 3333.33,
  "tokensReceived": 5000,
  "transactionHash": "0xabc123...",
  "blockNumber": 12345678,
  "confirmations": 15,
  "status": "confirmed",
  "platformFee": 100,
  "investedAt": "2026-01-30T21:30:00Z"
}
```

---

### 7. Data Room

#### GET /startups/:startupId/data-room
Get data room documents (investor only, requires access).

**Response:**
```json
{
  "documents": [
    {
      "_id": "doc123",
      "name": "Pitch Deck Q1 2026.pdf",
      "type": "pitch_deck",
      "uploadedAt": "2026-01-20T10:00:00Z",
      "accessControl": "investors_only"
    }
  ],
  "hasAccess": true
}
```

---

#### POST /startups/:startupId/data-room/upload
Upload document to data room (founder only).

**Request:** `multipart/form-data`
```
file: <file>
type: "pitch_deck" | "financials" | "legal" | "product" | "other"
accessControl: "public" | "investors_only" | "specific"
```

**Response:**
```json
{
  "_id": "doc123",
  "name": "Pitch Deck Q1 2026.pdf",
  "url": "https://cdn.launchpad.com/data-rooms/startup123/doc123.pdf",
  "type": "pitch_deck",
  "accessControl": "investors_only",
  "uploadedAt": "2026-01-30T21:35:00Z"
}
```

---

#### GET /data-room/documents/:docId/download
Download data room document (logs access).

**Response:**
```
HTTP 302 Redirect
Location: https://s3.amazonaws.com/signed-url-to-document
```

---

### 8. Analytics (Founder)

#### GET /startups/:startupId/analytics
Get startup analytics (founder only).

**Response:**
```json
{
  "views": {
    "total": 1234,
    "last7Days": 89,
    "last30Days": 456
  },
  "investorInterests": 56,
  "investments": {
    "count": 25,
    "totalUSD": 250000,
    "averageUSD": 10000
  },
  "dataRoomAccess": {
    "uniqueViewers": 42,
    "totalViews": 156,
    "mostViewedDoc": "Pitch Deck Q1 2026.pdf"
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "field": "fieldName" // (optional, for validation errors)
  }
}
```

### Common Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `INVALID_REQUEST` | Malformed request |
| 401 | `UNAUTHORIZED` | Missing or invalid auth token |
| 403 | `FORBIDDEN` | User doesn't have permission |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource already exists |
| 422 | `VALIDATION_ERROR` | Input validation failed |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

---

## Rate Limiting

- **Public endpoints**: 100 requests/minute
- **Authenticated endpoints**: 1000 requests/minute
- **Investment endpoints**: 10 requests/minute (prevent spam)

Headers returned:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1706652000
```

---

## Webhooks (Platform → External)

### Investment Created

When a new investment is confirmed:

```json
POST https://your-webhook-url.com/investment-created
{
  "event": "investment.created",
  "data": {
    "investmentId": "inv123",
    "investorId": "65abc123",
    "startupId": "startup123",
    "amountUSD": 5000,
    "createdAt": "2026-01-30T21:30:00Z"
  }
}
```

---

## SDK Example (TypeScript)

```typescript
import { LaunchPadClient } from '@launchpad/sdk';

const client = new LaunchPadClient({
  apiKey: process.env.LAUNCHPAD_API_KEY,
  environment: 'production'
});

// Authenticate with wallet
const { token } = await client.auth.verifySignature({
  walletAddress: '0x742d35Cc...',
  signature: '0xabc123...',
  challenge: '0x1a2b3c...'
});

client.setToken(token);

// Get startups
const startups = await client.startups.list({
  industry: 'FinTech',
  limit: 10
});

// Make investment
const investment = await client.investments.create({
  safeRoundId: 'round123',
  amountUSD: 5000,
  transactionHash: '0xdef456...'
});
```

---

**Next Steps**:
1. Implement API routes in Next.js `/pages/api`
2. Add request validation (Zod schemas)
3. Implement rate limiting (Redis)
4. Set up API documentation (Swagger/OpenAPI)
5. Create SDK for easier integration
