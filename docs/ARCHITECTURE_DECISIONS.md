# Architecture Decision Records (ADRs)

## ADR-001: Blockchain Platform Selection

**Date**: January 30, 2026  
**Status**: Accepted  
**Decision Makers**: Zeren Zou, Olivia Xiang

### Context

LaunchPad pitch deck mentions Solana for its speed and low fees, but current GoInvestMe platform is built on Ethereum. We need to decide which blockchain to use for MVP.

### Decision

**Phase 1 (MVP)**: Build on **Ethereum/Sepolia testnet**  
**Phase 3**: Migrate to **Solana** (Months 8-10)

### Rationale

**Why Ethereum First:**
1. **Speed to Market**: Team already has Ethereum/Solidity expertise
2. **Lower Risk**: Proven contracts already exist as foundation
3. **Easier Hiring**: More Solidity developers available if needed
4. **Faster MVP**: Estimated 3 months vs. 5-6 months with Solana learning curve

**Why Solana Later:**
1. **Vision Alignment**: Pitch deck specifically mentions Solana features
2. **Cost**: $0.001 vs. $5-20 per transaction benefits global talent payments
3. **Speed**: Sub-second finality improves UX for escrow releases
4. **Compliance**: Native transfer hooks and token extensions simplify regulation

### Consequences

**Positive:**
- Faster MVP launch (3 months vs. 6 months)
- Lower initial development risk
- Can validate market fit before major infrastructure investment
- Ethereum provides fallback if Solana migration delayed

**Negative:**
- Higher transaction costs in Phase 1 (may limit micro-payments)
- Need to rebuild all contracts for Phase 3
- Users will need to migrate wallets/tokens (Ethereum → Solana)
- Delayed access to Solana's compliance features

**Migration Plan:**
- Month 8: Start Solana contract development in parallel
- Month 9: Freeze Ethereum new features, focus on migration
- Month 10: Launch on Solana, provide migration tool for users

---

## ADR-002: MVP Scope

**Date**: January 30, 2026  
**Status**: Accepted

### Context

LaunchPad vision includes 3 user types (founders, investors, talent). Building all 3 at once is complex and risky.

### Decision

**Phase 1 MVP** (Months 1-4): **2-sided marketplace**
- Founders
- Investors
- Tokenized SAFEs
- KYC/KYB
- Data rooms

**Phase 2** (Months 5-7): Add **Talent marketplace**
- Global talent user type
- Escrow contracts
- Milestone tracking

### Rationale

1. **Market Validation**: Test founder-investor product-market fit first
2. **Complexity**: 2-sided marketplace is simpler to build and test
3. **Funding**: Can use Phase 1 to raise capital for Phase 2
4. **Learning**: Iterate based on founder/investor feedback before adding talent
5. **Revenue**: Platform fees from SAFEs start flowing in Month 4

### Consequences

**Positive:**
- Faster time to market (3 months)
- Lower initial development cost (~$80k vs. $160k)
- Can iterate based on real user feedback
- Less complex testing and security audit

**Negative:**
- Delayed revenue from talent marketplace fees
- Talent feature delayed by 3-5 months
- May lose competitive advantage if others launch talent marketplace first

---

## ADR-003: Team Structure

**Date**: January 30, 2026  
**Status**: Accepted

### Context

Building LaunchPad requires blockchain, frontend, backend, compliance expertise. Current team: 2 co-founders.

### Decision

**Core Team** (MVP Phase):
- Zeren Zou: Full-stack + blockchain lead
- Olivia Xiang: Strategy, operations, investor relations

**Contractors/Consultants**:
- Compliance consultant (part-time, $5k/month, 6 months)
- UX designer (contract, $8k/month, 2 months)
- Blockchain engineer (TBD - assess after Month 1)

**Post-MVP Hiring**:
- Consider full-time blockchain engineer for Solana migration
- Backend engineer for talent marketplace
- DevOps for scaling

### Rationale

1. **Capital Efficiency**: Minimize burn rate pre-revenue
2. **Flexibility**: Contractors allow scaling up/down as needed
3. **Focus**: Core team owns critical path, delegates specialized work
4. **Validation**: Prove concept before committing to large team

### Consequences

**Positive:**
- Lower burn rate (~$13k/month vs. $50k+)
- Flexibility to adjust based on progress
- Zeren gains deep platform knowledge

**Negative:**
- Zeren will be stretched thin
- Risk of slower development
- May need to cut features if capacity constrained
- Harder to scale post-launch without team

**Mitigation:**
- Set clear scope boundaries
- Hire contractors for non-critical-path work
- Re-assess hiring needs monthly

---

## ADR-004: Timeline & Milestones

**Date**: January 30, 2026  
**Status**: Accepted

### Context

Need to balance speed to market with quality and security.

### Decision

**Phase 1: Tokenized SAFE MVP**  
**Target**: End of April 2026 (3 months)

**Milestones:**
- Month 1 (Jan 30 - Feb 28): Research, architecture, smart contracts
- Month 2 (Mar 1 - Mar 31): Frontend, KYC integration
- Month 3 (Apr 1 - Apr 30): Testing, security audit, beta launch

**Phase 2: Talent Marketplace**  
**Target**: End of July 2026 (+3 months)

**Phase 3: Solana Migration**  
**Target**: End of October 2026 (+3 months)

### Rationale

1. **Competitive**: Fast enough to beat competitors to market
2. **Realistic**: Aligns with Zeren's capacity (full-time)
3. **Quality**: Includes time for proper testing and security
4. **Fundraising**: Phase 1 completion enables Series Seed raise

### Consequences

**Positive:**
- Clear deadlines drive focus
- MVP in Q2 2026 aligns with fundraising timeline
- Incremental launches reduce risk

**Negative:**
- Aggressive timeline may require feature cuts
- Risk of quality issues if rushed
- Limited buffer for unexpected issues

**Risk Mitigation:**
- Weekly progress reviews
- Cut features, not quality
- Pre-schedule security audit
- Beta launch before public launch

---

## ADR-005: Tech Stack (Frontend/Backend)

**Date**: January 30, 2026  
**Status**: Accepted

### Decision

**Keep Current Stack:**
- Frontend: Next.js 16, React, TypeScript, Tailwind
- Backend: Next.js API routes (serverless)
- Database: MongoDB Atlas (upgrade from current)
- Auth: Clerk or NextAuth.js
- Storage: AWS S3 (encrypted) for data rooms
- Blockchain: Ethereum (Sepolia) → Solana (later)

**New Additions:**
- KYC: Persona (selected after evaluation)
- Email: SendGrid
- Analytics: Mixpanel
- Monitoring: Sentry (already have), Datadog

### Rationale

1. **Leverage Existing**: Reuse 70% of GoInvestMe infrastructure
2. **Speed**: No learning curve for new frameworks
3. **Proven**: Stack already works in production
4. **Scalable**: Can handle expected load (1000s of users)

### Consequences

**Positive:**
- Faster development (familiar tools)
- Lower technical risk
- Easier to maintain

**Negative:**
- Limited to Next.js/Vercel ecosystem
- May need to refactor for scale later
- MongoDB may not be ideal for complex queries

---

## Summary of Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Blockchain** | Ethereum → Solana | Speed to market, then migrate |
| **MVP Scope** | 2-sided (founders + investors) | Validate fit before building talent |
| **Team** | 2 core + contractors | Capital efficiency |
| **Timeline** | 3 months to MVP | Competitive + realistic |
| **Tech Stack** | Keep current + add KYC | Leverage existing work |

---

**Next Steps**: Begin Phase 0 implementation with these decisions locked in.
