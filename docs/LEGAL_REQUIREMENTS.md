# SAFE Tokenization: Legal & Compliance Research

**Date**: January 30, 2026  
**Purpose**: Document legal requirements for tokenized SAFEs on LaunchPad platform

---

## What is a SAFE?

**SAFE** = Simple Agreement for Future Equity

Created by Y Combinator in 2013, a SAFE is a contract between an investor and company that grants the investor the right to receive equity in the future, typically triggered by:
- Equity financing round (Series A, B, etc.)
- Company acquisition
- IPO

---

## Traditional SAFE Terms

### Key Parameters

1. **Valuation Cap**: Maximum company valuation for conversion calculation
   - Example: $10M cap means investor converts as if company valued at $10M, even if Series A values it at $50M
   - Protects early investors from dilution

2. **Discount Rate**: Percentage discount on Series A share price
   - Example: 20% discount = if Series A shares are $1.00, SAFE converts at $0.80
   - Rewards early risk-taking

3. **Pro-Rata Rights**: Right to invest in future rounds to maintain ownership %
   - Prevents dilution in subsequent rounds

4. **Most Favored Nation (MFN)**: If better terms issued later, investor gets those terms

---

## Tokenization: Legal Considerations

### 1. Securities Law Compliance

**United States (SEC)**

**Is a tokenized SAFE a security?**  
✅ **YES** - Under the Howey Test:
1. ☑️ Investment of money
2. ☑️ In a common enterprise  
3. ☑️ With expectation of profits
4. ☑️ From efforts of others

**Legal Framework:**
- Must comply with Securities Act of 1933
- Must register OR qualify for exemption

**Common Exemptions:**
- **Regulation D (Reg D)**:
  - Rule 506(b): Accredited investors only, no general solicitation
  - Rule 506(c): Accredited investors only, general solicitation allowed (must verify)
  - No SEC filing required, but Form D must be filed

- **Regulation CF (Crowdfunding)**:
  - Non-accredited investors allowed
  - $5M max raise per 12 months
  - Must use registered broker-dealer or funding portal
  - Extensive disclosure requirements

- **Regulation A (Reg A+)**:
  - Tier 1: Up to $20M/year
  - Tier 2: Up to $75M/year (testing-the-waters allowed)
  - SEC qualification required
  - Allows general solicitation

**Our Recommendation for LaunchPad**: **Regulation D, Rule 506(c)**
- ✅ Can publicly advertise (general solicitation)
- ✅ No raise limit
- ✅ Must verify accredited investor status (we're doing KYC anyway)
- ⚠️ Limited to accredited investors only

### 2. State Securities Laws (Blue Sky Laws)

**Fortunate Exception**: Reg D 506(b) and 506(c) are **federally covered** = pre-empts most state securities laws

**Still Required:**
- Notice filings in states where investors reside
- Pay state filing fees (~$100-500 per state)

### 3. Anti-Money Laundering (AML) / Know Your Customer (KYC)

**Requirements:**
- Collect investor information (name, address, DOB, SSN/TIN)
- Verify identity through government ID
- Check against OFAC sanctions lists
- Maintain records for 5+ years
- Report suspicious transactions (if required)

**Accredited Investor Verification (Rule 506(c))**

Must verify using one of these methods:
1. Review tax documents (W-2, 1040, K-1)
2. Review account statements (brokerage, bank)
3. Written confirmation from CPA, attorney, or broker
4. Use third-party accreditation verification service ⭐ **Our approach**

**Accredited Investor Definition:**
- Income: >$200k individual or >$300k joint for past 2 years
- Net worth: >$1M excluding primary residence
- Professional: Series 7, 65, or 82 license holders
- Entities: >$5M in assets

### 4. Transfer Restrictions

**Why needed:**
- Maintain exemption status (Reg D doesn't allow free trading)
- Prevent non-accredited investors from acquiring
- Comply with lock-up periods

**Implementation:**
- Smart contract enforces transfer restrictions
- Transfers only to KYC'd, accredited investors
- White-list approach
- Lock-up period (typically 12 months from issuance)

### 5. Disclosure Requirements

**Must Provide to Investors:**
- Company description and business plan
- Use of proceeds
- Risk factors
- Management team information
- Financial statements (balance sheet, income statement)
- Terms of the SAFE (valuation cap, discount)
- Dilution scenarios
- Related party transactions

**Our Data Room Solution:**
- Secure document hosting (IPFS + access control)
- Standardized templates for disclosures
- Investor access tracking (compliance audit trail)

---

## International Considerations

### European Union (MiFID II / PRIIPs)

**Requirements:**
- Tokenized SAFEs likely classified as "complex financial instruments"
- Key Information Document (KID) required
- Investor appropriateness tests
- Stricter retail investor protections

**Our Approach**: 
- Start with US-only (easier regulatory path)
- Add EU in Phase 2 with proper legal counsel

### Singapore (MAS)

**Securities and Futures Act**:
- Similar to US - tokenized SAFEs are securities
- Prospectus required OR exemption (similar to Reg D)
- KYC/AML requirements

### Cayman Islands / BVI

**Popular for crypto/token offerings:**
- More flexible regulatory environment
- Still requires legal framework
- May help with international investors

---

## Smart Contract Legal Requirements

### 1. Immutability vs. Legal Changes

**Problem**: Smart contracts are immutable, but legal terms may need changing

**Solution**:
- Use upgradeable proxy pattern (UUPS)
- Governance mechanism for critical changes
- Emergency pause function
- Clear terms that code ≠ entire legal agreement

### 2. Legal Status of Smart Contracts

**Wyoming (DUNA)**: Recognizes DAOs as legal entities  
**Vermont**: Blockchain-based LLCs allowed

**Our Approach**:
- Smart contract enforces economic terms
- Written legal agreement is ultimate authority
- Code + legal docs = complete contract

### 3. Investor Protection

**Required Features:**
- Refund mechanism if minimum not met
- Transparency (all terms on-chain)
- Audit trail
- Emergency controls

---

## Compliance Checklist for LaunchPad

### Pre-Launch
- [ ] Engage securities lawyer (SEC specialist)
- [ ] Draft SAFE legal template
- [ ] Create investor disclosure templates
- [ ] Implement accredited investor verification
- [ ] Set up AML/KYC procedures
- [ ] Draft Terms of Service
- [ ] Draft Privacy Policy
- [ ] Create Risk Disclosure document

### Per SAFE Offering
- [ ] File Form D with SEC (15 days after first sale)
- [ ] File state notice filings
- [ ] Collect investor information (Form W-9 or W-8)
- [ ] Verify accredited investor status
- [ ] Provide disclosure documents
- [ ] Execute subscription agreements
- [ ] Maintain investor records

### Ongoing
- [ ] Annual report to investors (if Reg A)
- [ ] Maintain AML/KYC records (5 years)
- [ ] Monitor regulatory changes
- [ ] Update legal agreements as needed

---

## Cost Estimates

### One-Time Legal Costs
| Item | Estimated Cost |
|------|---------------|
| Securities lawyer consultation | $10,000 - $20,000 |
| SAFE template drafting | $5,000 - $10,000 |
| Terms of Service & Privacy Policy | $3,000 - $5,000 |
| Platform legal review | $10,000 - $15,000 |
| **Total One-Time** | **$28,000 - $50,000** |

### Per-Offering Costs
| Item | Estimated Cost |
|------|---------------|
| Form D filing (federal) | $0 (free) |
| State notice filings | $100 - $500 per state |
| Legal review of offering docs | $2,000 - $5,000 |
| **Total Per Offering** | **$2,000 - $10,000** |

### Platform Ongoing
| Item | Estimated Cost |
|------|---------------|
| Compliance consultant (retainer) | $5,000/month |
| KYC/AML provider | $1 - $5 per verification |
| Legal updates & changes | $10,000/year |

---

## Recommendations for LaunchPad

### Phase 1 (MVP)
1. **Start US-only** with Regulation D, Rule 506(c)
2. **Accredited investors only** (simpler compliance)
3. **Partner with KYC provider** that handles accreditation verification
4. **Engage securities lawyer** before public launch
5. **Standardize SAFE terms** (reduce legal overhead)

### Phase 2 (Expansion)
6. **Add Regulation CF** for non-accredited investors
7. **International expansion** (start with Singapore)
8. **Institutional offerings** (Reg D, Rule 506(b) to VCs)

### Risk Mitigation
- Clear disclaimers ("not investment advice")
- Robust KYC/AML procedures
- Document everything (compliance audit trail)
- Regular legal reviews
- Errors & omissions insurance

---

## Key Contacts Needed

1. **Securities Lawyer**: Specializing in token offerings
   - Recommended firms: Cooley LLP, Perkins Coie, Morrison & Foerster

2. **Compliance Consultant**: SEC reporting & filings
   
3. **Tax Advisor**: Treatment of tokens for tax purposes

4. **KYC/Accreditation Provider**: (see KYC evaluation doc)

---

## Next Steps

- [ ] Schedule consultation with securities lawyer (Week 1)
- [ ] Review Y Combinator's standard SAFE agreements
- [ ] Research tokenized securities precedents
- [ ] Finalize KYC provider selection
- [ ] Draft compliance procedures manual

---

**Status**: Research complete, ready for legal consultation  
**Recommended Budget**: $30-50k for legal framework  
**Timeline**: 2-3 weeks for legal documents with lawyer
