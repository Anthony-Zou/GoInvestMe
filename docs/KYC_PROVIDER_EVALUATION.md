# KYC/KYB Provider Evaluation

**Date**: January 30, 2026  
**Purpose**: Compare KYC/KYB providers for LaunchPad platform

---

## Requirements

### Must-Have Features
- ✅ Identity verification (government ID + selfie)
- ✅ **Accredited investor verification** (critical for Reg D 506(c))
- ✅ Business verification (KYB)
- ✅ AML/sanctions screening (OFAC, PEP lists)
- ✅ API integration
- ✅ Webhook notifications
- ✅ Global coverage (start with US, expand internationally)

### Nice-to-Have
- Document verification (tax forms, bank statements)
- Liveness detection (prevent spoofing)
- Ongoing monitoring
- White-label UI
- Compliance dashboard

---

## Provider Comparison

### 1. Persona ⭐ **RECOMMENDED**

**Overview**: Modern identity verification platform, popular in fintech

**Pros:**
- ✅ Excellent developer experience
- ✅ Clean API and SDKs
- ✅ **Accredited investor verification** included
- ✅ Document verification (W-2, 1099, brokerage statements)
- ✅ Embeddable UI components (low code integration)
- ✅ Real-time webhooks
- ✅ Global coverage (200+ countries)
- ✅ Liveness detection built-in
- ✅ Reasonable pricing

**Cons:**
- ⚠️ Newer company (less established than Onfido)
- ⚠️ Fewer enterprise references

**Pricing:**
- Identity verification: $1 - $3 per verification
- Accredited investor verification: $25 - $50 per verification
- Custom pricing for high volume

**Integration Effort**: 🟢 Low (1-2 weeks)

**Website**: https://withpersona.com

---

### 2. Onfido

**Overview**: Established identity verification, used by Revolut, Zipcar

**Pros:**
- ✅ Very established (10+ years)
- ✅ Strong fraud detection
- ✅ AI-powered document verification
- ✅ Global coverage
- ✅ SOC 2 Type II certified
- ✅ Government partnerships

**Cons:**
- ⚠️ **No built-in accredited investor verification** (major gap)
- ⚠️ More expensive
- ⚠️ Older API design (less developer-friendly)
- ⚠️ Longer setup time

**Pricing:**
- Identity verification: $2 - $4 per check
- Document verification: Add-on pricing
- Enterprise contracts only for advanced features

**Integration Effort**: 🟡 Medium (2-4 weeks)

**Website**: https://onfido.com

---

### 3. Sumsub

**Overview**: Compliance platform for crypto/fintech

**Pros:**
- ✅ Crypto-native (understands our use case)
- ✅ Full KYC/KYB/AML suite
- ✅ Accredited investor checks available
- ✅ Ongoing monitoring
- ✅ Compliance dashboard
- ✅ Lower pricing than Onfido

**Cons:**
- ⚠️ UI less polished
- ⚠️ Documentation could be better
- ⚠️ Smaller team/support

**Pricing:**
- KYC: $1.50 - $3 per verification
- KYB: $10 - $20 per business
- Accredited investor: $30 - $50
- Volume discounts available

**Integration Effort**: 🟡 Medium (2-3 weeks)

**Website**: https://sumsub.com

---

### 4. Jumio

**Overview**: Enterprise-grade identity verification

**Pros:**
- ✅ Very robust fraud prevention
- ✅ Large enterprise clients (Uber, Airbnb)
- ✅ Global reach
- ✅ High accuracy rates

**Cons:**
- ⚠️ Enterprise-focused (may be overkill for MVP)
- ⚠️ Expensive
- ⚠️ No accredited investor verification
- ⚠️ Long sales cycle

**Pricing:**
- Custom pricing (typically $3-5+ per check)
- Minimum contracts

**Integration Effort**: 🔴 High (4-6 weeks)

**Website**: https://jumio.com

---

### 5. Parallel Markets ⭐ **ALTERNATIVE FOR ACCREDITATION**

**Overview**: Specialized in accredited investor verification for private securities

**Pros:**
- ✅ **Purpose-built for accredited investor verification**
- ✅ Integrated with broker-dealers
- ✅ Fastest verification (minutes)
- ✅ Investor accreditation network (one verification, multiple platforms)
- ✅ Securities law expertise

**Cons:**
- ⚠️ Doesn't do basic KYC (need separate provider)
- ⚠️ US-focused only
- ⚠️ Pricing not public

**Pricing:**
- Contact for quote (estimated $20-40 per verification)

**Integration Effort**: 🟢 Low (API available)

**Website**: https://parallelmarkets.com

**Strategy**: Could use Persona for KYC + Parallel Markets for accreditation

---

## Decision Matrix

| Feature | Persona | Onfido | Sumsub | Jumio | Parallel Markets |
|---------|---------|--------|--------|-------|------------------|
| **Identity Verification** | ✅ Excellent | ✅ Excellent | ✅ Good | ✅ Excellent | ❌ No |
| **Accredited Investor** | ✅ Yes | ❌ No | ✅ Yes | ❌ No | ✅ Best-in-class |
| **Business Verification** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Developer Experience** | ✅ Excellent | 🟡 Good | 🟡 Fair | 🟡 Good | ✅ Good |
| **Global Coverage** | ✅ 200+ countries | ✅ Global | ✅ Global | ✅ Global | ⚠️ US only |
| **Pricing** | 💰 $$ | 💰💰 $$$ | 💰 $ | 💰💰💰 $$$$ | 💰💰 $$ |
| **Integration Time** | 🟢 1-2 weeks | 🟡 2-4 weeks | 🟡 2-3 weeks | 🔴 4-6 weeks | 🟢 1-2 weeks |
| **Best For** | **MVP** | Enterprise | Crypto | Large corps | Securities |

---

## Recommendation

### Option 1: Persona Only ⭐ **RECOMMENDED FOR MVP**

**Rationale:**
- Single provider = simpler integration
- Has all features we need (KYC + KYB + accreditation)
- Best developer experience
- Reasonable pricing
- Fastest time to market

**Cost**: ~$3 + $40 = **$43 per investor verification**

**Timeline**: 1-2 weeks integration

---

### Option 2: Persona (KYC) + Parallel Markets (Accreditation)

**Rationale:**
- Best-in-class for each function
- Parallel Markets has investor network (easier re-verification)
- More expensive but higher quality

**Cost**: ~$3 (Persona KYC) + $30 (Parallel accreditation) = **$33 per investor**

**Timeline**: 2-3 weeks integration (two systems)

---

### Option 3: Sumsub (Budget Option)

**Rationale:**
- Lowest cost
- Crypto-native (understands our space)
- All features included

**Cost**: ~$3 + $30 = **$33 per investor verification**

**Timeline**: 2-3 weeks integration

**Risks**: Less polished UX, newer company

---

## Implementation Plan

### Week 2: Persona Integration (Recommended)

**Day 1-2: Setup**
- [ ] Create Persona account
- [ ] Get API keys (sandbox + production)
- [ ] Review documentation
- [ ] Set up webhook endpoint

**Day 3-5: Identity Verification**
- [ ] Implement Persona inquiry creation API
- [ ] Embed Persona UI in registration flow
- [ ] Handle verification webhooks
- [ ] Update user status in database
- [ ] Test full KYC flow

**Day 6-7: Accredited Investor Verification**
- [ ] Configure accreditation workflow
- [ ] Implement document upload
- [ ] Test with sample documents
- [ ] Handle approval/rejection logic

**Day 8-10: Business Verification (KYB)**
- [ ] Configure business inquiry type
- [ ] Collect EIN, business docs
- [ ] Beneficial ownership verification
- [ ] Test with sample business

**Testing:**
- [ ] Test happy path (approved)
- [ ] Test rejection scenarios
- [ ] Test edge cases (expired ID, blurry photo)
- [ ] Load testing

---

## Integration Code Sketch

### Frontend (Next.js)

```typescript
// pages/onboarding/kyc.tsx
import { useEffect } from 'react';

export default function KYCPage() {
  useEffect(() => {
    // Load Persona client
    const client = new Persona.Client({
      templateId: process.env.NEXT_PUBLIC_PERSONA_TEMPLATE_ID,
      environment: 'sandbox',
      onComplete: ({ inquiryId }) => {
        // Save inquiry ID to database
        fetch('/api/kyc/complete', {
          method: 'POST',
          body: JSON.stringify({ inquiryId })
        });
      }
    });
    
    client.open();
  }, []);
  
  return <div id="persona-container" />;
}
```

### Backend (API Route)

```typescript
// pages/api/kyc/webhook.ts
import { Persona } from 'persona';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  // Verify webhook signature
  const isValid = Persona.Webhooks.verify(
    req.body,
    req.headers['persona-signature'],
    process.env.PERSONA_WEBHOOK_SECRET
  );
  
  if (!isValid) return res.status(401).json({ error: 'Invalid signature' });
  
  const { data } = req.body;
  
  switch (data.type) {
    case 'inquiry.completed':
      // KYC passed
      await updateUserKYCStatus(data.attributes.referenceId, 'approved');
      break;
      
    case 'inquiry.failed':
      // KYC failed
      await updateUserKYCStatus(data.attributes.referenceId, 'rejected');
      break;
  }
  
  res.status(200).json({ received: true });
}
```

---

## Costs by User Volume

| Monthly Users | Provider | Cost per User | Total Monthly |
|--------------|----------|---------------|---------------|
| 100 | Persona | $43 | $4,300 |
| 500 | Persona | $43 | $21,500 |
| 1,000 | Persona (negotiated) | $35 | $35,000 |
| 5,000 | Persona (enterprise) | $25 | $125,000 |

**Note**: Prices decrease with volume. Negotiate at 500+ users/month.

---

## Compliance Features Needed

### User Dashboard
- [ ] KYC status display
- [ ] Re-verification option (if expired)
- [ ] Accreditation certificate download
- [ ] Privacy controls (data deletion)

### Admin Dashboard
- [ ] Manual review queue
- [ ] Approve/reject overrides
- [ ] Compliance reports
- [ ] Audit trail

---

## Next Steps

1. **Week 1**: 
   - [ ] Sign up for Persona sandbox account
   - [ ] Get demo/walkthrough from Persona sales
   - [ ] Review API documentation

2. **Week 2**:
   - [ ] Implement KYC flow (identity verification)
   - [ ] Test in sandbox environment
   - [ ] Get legal approval for workflow

3. **Week 3**:
   - [ ] Add accredited investor verification
   - [ ] Implement KYB for startups
   - [ ] Production testing

---

**Decision**: **Persona** for MVP  
**Budget**: $43 per investor, $10-20 per startup  
**Implementation**: Weeks 2-3 of development plan
