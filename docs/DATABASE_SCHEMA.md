# LaunchPad Database Schema

**Version**: 1.0  
**Date**: January 30, 2026  
**Database**: MongoDB Atlas (document store)

---

## Overview

LaunchPad uses MongoDB for flexibility with evolving business requirements. The schema is designed to support 3 user types, tokenized SAFEs, KYC/KYB workflows, and data rooms.

---

## Collections

### 1. Users

**Purpose**: Core user accounts (all types: founders, investors, talent)

```typescript
interface User {
  _id: ObjectId;
  
  // Identity
  email: string;                    // Unique, indexed
  walletAddress: string;            // Ethereum address, indexed
  passwordHash?: string;            // Optional for email/password auth
  
  // Profile
  userType: 'founder' | 'investor' | 'talent';
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  bio?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  
  // KYC/Verification
  kycStatus: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'expired';
  kycProvider: 'persona' | 'onfido' | 'manual';
  kycInquiryId?: string;           // Provider's inquiry ID
  kycCompletedAt?: Date;
  kycExpiresAt?: Date;
  kycRejectionReason?: string;
  
  // Investor-specific
  accreditationStatus?: 'none' | 'pending' | 'accredited' | 'institutional';
  accreditationVerifiedAt?: Date;
  accreditationExpiresAt?: Date;
  investmentCap?: number;          // Max investment per round (if applicable)
  jurisdiction?: string;            // ISO country code
  
  // Founder-specific
  startupIds?: ObjectId[];         // References to Startup collection
  
  // Talent-specific
  skills?: string[];
  hourlyRate?: number;
  availability?: 'full-time' | 'part-time' | 'contract';
  
  // System
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}
```

**Indexes:**
- `{ email: 1 }` - unique
- `{ walletAddress: 1 }` - unique, sparse
- `{ userType: 1, kycStatus: 1 }` - for filtering
- `{ kycStatus: 1, accreditationStatus: 1 }` - investor queries

---

### 2. Startups

**Purpose**: Startup company profiles

```typescript
interface Startup {
  _id: ObjectId;
  
  // Identity
  companyName: string;
  slug: string;                    // URL-friendly, unique, indexed
  logoUrl?: string;
  websiteUrl?: string;
  
  // Founders
  founderUserId: ObjectId;         // Primary founder (User._id)
  coFounderUserIds?: ObjectId[];   // Additional co-founders
  
  // Company Details
  industry: string;                // e.g., "FinTech", "HealthTech"
  stage: 'idea' | 'mvp' | 'revenue' | 'growth';
  description: string;             // Short pitch
  pitch: string;                   // Long-form pitch
  foundedDate?: Date;
  incorporationCountry?: string;
  ein?: string;                    // Tax ID (encrypted)
  
  // Team
  teamSize?: number;
  teamMembers?: Array<{
    name: string;
    role: string;
    linkedinUrl?: string;
  }>;
  
  // KYB Verification
  kybStatus: 'pending' | 'in_progress' | 'approved' | 'rejected';
  kybProvider: 'persona' | 'manual';
  kybInquiryId?: string;
  kybCompletedAt?: Date;
  kybDocuments?: Array<{
    type: string;               // 'articles_of_incorporation', 'ein_letter', etc.
    url: string;                // S3/IPFS URL
    uploadedAt: Date;
  }>;
  
  // Data Room
  dataRoomCID?: string;           // IPFS hash or S3 prefix
  dataRoomDocuments?: Array<{
    _id: ObjectId;
    name: string;
    type: 'pitch_deck' | 'financials' | 'legal' | 'product' | 'other';
    url: string;
    uploadedAt: Date;
    accessControl: 'public' | 'investors_only' | 'specific';  // If specific, use accessList
    accessList?: ObjectId[];    // User IDs who can access
  }>;
  
  // Fundraising
  safeRounds?: ObjectId[];        // References to SAFERound collection
  totalRaised?: number;           // Cumulative across all rounds
  
  // Metrics
  monthlyRevenue?: number;
  monthlyGrowthRate?: number;     // Percentage
  customerCount?: number;
  
  // Social
  views: number;
  investorInterests: number;      // Count of "interested" clicks
  
  // System
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  featured: boolean;
}
```

**Indexes:**
- `{ slug: 1 }` - unique
- `{ founderUserId: 1 }` - find startups by founder
- `{ kybStatus: 1 }` - filter verified startups
- `{ industry: 1, stage: 1, isActive: 1 }` - browse/search
- `{ featured: 1, createdAt: -1 }` - featured startups

---

### 3. SAFERounds

**Purpose**: Funding rounds using tokenized SAFEs

```typescript
interface SAFERound {
  _id: ObjectId;
  
  // Basic Info
  startupId: ObjectId;            // Reference to Startup
  roundName: string;              // e.g., "Pre-Seed A", "Seed Round"
  
  // SAFE Terms
  valuationCap: number;           // USD
  discountRate: number;           // Percentage (e.g., 20)
  proRata: boolean;               // Pro-rata rights
  
  // Fundraising Target
  minimumRaise: number;           // USD
  maximumRaise: number;           // USD (hard cap)
  minimumInvestment: number;      // Per investor
  maximumInvestment?: number;     // Per investor (optional)
  
  // Timeline
  startDate: Date;
  endDate: Date;
  
  // Smart Contract
  contractAddress?: string;       // Ethereum contract address
  tokenSymbol?: string;           // e.g., "STARTUP-SAFE"
  deployedAt?: Date;
  deploymentTxHash?: string;
  
  // Progress
  totalInvested: number;          // Running total
  investorCount: number;          // Unique investors
  status: 'draft' | 'active' | 'closed_success' | 'closed_failed' | 'converted';
  
  // Platform Fee
  platformFeePercent: number;     // e.g., 2.0
  platformFeeCollected: number;
  
  // Conversion
  convertedAt?: Date;
  seriesARound?: {
    valuationAtConversion: number;
    conversionRate: number;       // Tokens to equity ratio
  };
  
  // System
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `{ startupId: 1 }` - rounds for a startup
- `{ status: 1, endDate: 1 }` - active rounds
- `{ contractAddress: 1 }` - unique, sparse

---

### 4. Investments

**Purpose**: Track individual investments in SAFE rounds

```typescript
interface Investment {
  _id: ObjectId;
  
  // Parties
  investorUserId: ObjectId;       // Reference to User
  startupId: ObjectId;            // Reference to Startup
  safeRoundId: ObjectId;          // Reference to SAFERound
  
  // Investment Details
  amountUSD: number;
  amountETH: number;              // Amount in ETH at time of investment
  ethToUsdRate: number;           // Exchange rate at investment time
  tokensReceived: number;         // SAFE tokens minted
  
  // Transaction
  transactionHash: string;        // Blockchain tx hash
  blockNumber?: number;
  investedAt: Date;
  
  // Status
  status: 'pending' | 'confirmed' | 'failed' | 'refunded' | 'converted';
  confirmations?: number;
  
  // Refund (if round failed)
  refundedAt?: Date;
  refundTxHash?: string;
  
  // Conversion (when SAFE converts to equity)
  convertedAt?: Date;
  equityShares?: number;
  equityPercentage?: number;
  
  // Platform Fee
  platformFee: number;            // USD
  
  // System
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `{ investorUserId: 1, createdAt: -1 }` - investor's portfolio
- `{ safeRoundId: 1 }` - all investments in a round
- `{ startupId: 1 }` - all investments in a startup
- `{ transactionHash: 1 }` - unique
- `{ status: 1 }` - filter by status

---

### 5. DataRoomAccess

**Purpose**: Track who accessed data room documents (audit trail)

```typescript
interface DataRoomAccess {
  _id: ObjectId;
  
  // References
  startupId: ObjectId;
  documentId: ObjectId;           // From Startup.dataRoomDocuments._id
  investorUserId: ObjectId;
  
  // Access Details
  accessedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  
  // Action
  action: 'view' | 'download';
  
  // System
  createdAt: Date;
}
```

**Indexes:**
- `{ startupId: 1, createdAt: -1 }` - audit trail for startup
- `{ investorUserId: 1, createdAt: -1 }` - investor activity
- `{ documentId: 1 }` - document access stats

---

### 6. KYCWebhooks

**Purpose**: Log all KYC webhook events from Persona

```typescript
interface KYCWebhook {
  _id: ObjectId;
  
  // Webhook Data
  provider: 'persona' | 'onfido';
  eventType: string;              // e.g., "inquiry.completed", "inquiry.failed"
  inquiryId: string;
  userId?: ObjectId;              // Matched User._id
  
  // Payload
  rawPayload: object;             // Full webhook payload
  
  // Processing
  processed: boolean;
  processedAt?: Date;
  error?: string;
  
  // System
  receivedAt: Date;
}
```

**Indexes:**
- `{ inquiryId: 1 }` - lookup by inquiry
- `{ userId: 1, receivedAt: -1 }` - user's KYC history
- `{ processed: 1, receivedAt: 1 }` - unprocessed webhooks

---

### 7. ActivityLog

**Purpose**: Track important user actions (for analytics and compliance)

```typescript
interface ActivityLog {
  _id: ObjectId;
  
  // Actor
  userId?: ObjectId;
  walletAddress?: string;
  ipAddress?: string;
  
  // Action
  action: string;                 // e.g., "user.login", "investment.created", "document.accessed"
  resource?: string;              // e.g., "Startup:abc123"
  details?: object;               // Action-specific data
  
  // Result
  success: boolean;
  error?: string;
  
  // System
  createdAt: Date;
}
```

**Indexes:**
- `{ userId: 1, createdAt: -1 }` - user activity timeline
- `{ action: 1, createdAt: -1 }` - analytics
- `{ createdAt: -1 }` - recent activity (TTL index, expire after 90 days)

---

## Relationships

```
User (founder)
  ├── hasMany Startups
  └── hasMany ActivityLog

User (investor)
  ├── hasMany Investments
  ├── hasMany DataRoomAccess
  └── hasMany ActivityLog

Startup
  ├── belongsTo User (founder)
  ├── hasMany SAFERounds
  ├── hasMany Investments
  └── hasMany DataRoomAccess

SAFERound
  ├── belongsTo Startup
  └── hasMany Investments

Investment
  ├── belongsTo User (investor)
  ├── belongsTo Startup
  └── belongsTo SAFERound
```

---

## Data Migration Plan

### From GoInvestMe to LaunchPad

Since we're pivoting from simple GoInvestMe to LaunchPad, existing data needs migration:

```typescript
// Migration script pseudocode
async function migrateGoInvestMeData() {
  // 1. Migrate entrepreneurs to Users + Startups
  const entrepreneurs = await OldEntrepreneursCollection.find();
  for (const entrepreneur of entrepreneurs) {
    // Create User
    const user = await Users.create({
      email: entrepreneur.email,
      walletAddress: entrepreneur.walletAddress,
      userType: 'founder',
      firstName: entrepreneur.name.split(' ')[0],
      lastName: entrepreneur.name.split(' ').slice(1).join(' '),
      kycStatus: 'pending',
      createdAt: entrepreneur.createdAt
    });
    
    // Create Startup
    const startup = await Startups.create({
      companyName: entrepreneur.projectName,
      slug: slugify(entrepreneur.projectName),
      founderUserId: user._id,
      description: entrepreneur.description,
      kybStatus: 'pending',
      createdAt: entrepreneur.createdAt
    });
    
    user.startupIds = [startup._id];
    await user.save();
  }
  
  // 2. Migrate coins to SAFERounds
  const coins = await OldCoinsCollection.find();
  for (const coin of coins) {
    const startup = await Startups.findOne({ companyName: coin.projectName });
    const round = await SAFERounds.create({
      startupId: startup._id,
      roundName: 'Initial Round',
      valuationCap: coin.pricePerCoin * coin.totalSupply * 10, // Estimate
      minimumRaise: 0,
      maximumRaise: coin.pricePerCoin * coin.totalSupply,
      minimumInvestment: coin.pricePerCoin,
      startDate: coin.createdAt,
      endDate: new Date(coin.createdAt.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
      contractAddress: coin.contractAddress,
      totalInvested: coin.coinsSold * coin.pricePerCoin,
      investorCount: coin.investors?.length || 0,
      status: coin.active ? 'active' : 'closed_success'
    });
  }
  
  // 3. Create Investments from on-chain data
  // (Would need to query blockchain for investment events)
}
```

---

## Backup & Recovery

### Backup Strategy
- **Automated**: MongoDB Atlas daily snapshots (7-day retention)
- **Point-in-time**: Continuous backups (restore to any second in last 24 hours)
- **Manual**: Weekly exports to S3
- **Critical Collections**: Users, Investments backed up hourly

### Data Retention
- **Users**: Indefinite (unless requested deletion - GDPR)
- **Startups**: Indefinite
- **Investments**: Indefinite (financial records)
- **Data Room Access**: 7 years (compliance)
- **Activity Log**: 90 days (TTL index)
- **KYC Webhooks**: 5 years (AML compliance)

---

## Security Considerations

### Encryption
- **At Rest**: MongoDB Atlas encryption enabled
- **In Transit**: TLS 1.2+ for all connections
- **Field-Level Encryption**: 
  - User.ein (business tax ID)
  - Sensitive KYC documents

### Access Control
- **Application Layer**: Role-based access (RBAC)
- **Database Layer**: MongoDB Atlas IP whitelist
- **Secrets**: AWS Secrets Manager for DB credentials

### PII Handling
- **User Deletion**: Soft delete (isActive=false) + anonymize PII
- **Right to Access**: Export user data on request (GDPR/CCPA)
- **Data Minimization**: Only collect what's needed

---

## Performance Optimization

### Indexing Strategy
- All primary lookup fields indexed
- Compound indexes for common queries
- Partial indexes where applicable (e.g., active users only)

### Sharding Plan (Future)
- Shard key: `{ startupId: 1 }` for Investments (when >1M records)
- Shard key: `{ userId: 1 }` for ActivityLog

### Caching
- **Redis**: Cache user profiles, startup listings
- **TTL**: 5 minutes for startup data, 1 hour for user profiles
- **Invalidation**: On updates via pub/sub

---

## Testing Data

### Seed Script

```typescript
// scripts/seed-test-data.ts
async function seedTestData() {
  // Create test founder
  const founder = await User.create({
    email: 'founder@test.com',
    walletAddress: '0x1234...',
    userType: 'founder',
    firstName: 'Test',
    lastName: 'Founder',
    kycStatus: 'approved',
    emailVerified: true
  });
  
  // Create test startup
  const startup = await Startup.create({
    companyName: 'Test Startup Inc',
    slug: 'test-startup',
    founderUserId: founder._id,
    industry: 'FinTech',
    stage: 'mvp',
    description: 'A revolutionary test startup',
    kybStatus: 'approved'
  });
  
  // Create test investor
  const investor = await User.create({
    email: 'investor@test.com',
    walletAddress: '0x5678...',
    userType: 'investor',
    firstName: 'Test',
    lastName: 'Investor',
    kycStatus: 'approved',
    accreditationStatus: 'accredited',
    emailVerified: true
  });
  
  // Create SAFE round
  const round = await SAFERound.create({
    startupId: startup._id,
    roundName: 'Pre-Seed',
    valuationCap: 10000000, // $10M
    discountRate: 20,
    minimumRaise: 100000,
    maximumRaise: 1000000,
    minimumInvestment: 1000,
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    status: 'active',
    platformFeePercent: 2.0
  });
}
```

---

**Next Steps**: 
1. Implement Mongoose schemas with TypeScript
2. Create database indexes
3. Set up connection pooling
4. Write migration scripts
