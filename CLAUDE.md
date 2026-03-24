# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GoInvestMe (LaunchPad)** is a decentralized investment platform enabling founders to tokenize fundraising rounds (as SAFE agreements) and accept crypto investments from global investors. It is a monorepo with three distinct workspaces:

- `frontend/` — Next.js 16 web app (main application)
- `blockchain/` — Hardhat smart contracts (Solidity 0.8.28)
- `docs/` — Architecture and design documentation

## Commands

### Frontend (run from `frontend/`)

```bash
npm run dev          # Start Next.js dev server (Turbopack enabled)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run all tests (Vitest)
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
npm run test:ci      # CI mode (run + coverage)
npm run test:working # Run curated stable subset of tests
# Run a specific test file:
npx vitest run src/__tests__/basic.test.ts
```

### Blockchain (run from `blockchain/` or root)

```bash
npm run compile      # Compile Solidity contracts
npm run test         # Run Hardhat tests
npm run node         # Start local Hardhat node
npm run deploy:local # Deploy to local Hardhat node
npm run deploy:sepolia # Deploy to Sepolia testnet
npm run verify:sepolia # Verify contracts on Etherscan
```

### Database

```bash
# Start PostgreSQL (Docker required)
docker-compose up -d

# From frontend/:
npx prisma migrate dev    # Apply migrations
npx prisma generate       # Regenerate Prisma client
npx prisma studio         # Visual DB browser
```

## Architecture

### Frontend Structure

The app uses **Next.js App Router** with the following key directories under `frontend/src/`:

- `app/` — Pages and API routes
  - `app/api/` — Serverless API handlers (auth, team, kyc, waitlist)
  - `app/founder/` — Founder dashboard flows
  - `app/investor/` — Investor browsing and investment flows
  - `app/talent/` — Talent waitlist and profiles
- `components/` — Reusable UI components
- `lib/` — Shared utilities, config, Prisma client, logger
- `hooks/` — Custom React + Wagmi hooks for blockchain interaction
- `__tests__/` — Vitest test files

### Configuration System

All environment variables flow through `frontend/src/lib/config.ts` as a **validated singleton**. The config validates at startup and throws on missing required vars. Required vars: `NEXT_PUBLIC_NETWORK_NAME`, `NEXT_PUBLIC_CHAIN_ID`, and the relevant contract address for the selected network.

Key env vars:
- `NEXT_PUBLIC_NETWORK_NAME` — `sepolia` or `mainnet`
- `NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS` — deployed contract address
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — WalletConnect v2
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — NextAuth.js secret

### Authentication Flow

Auth is wallet-based using **SIWE (Sign-In with Ethereum)**:
1. Frontend requests a nonce from `/api/auth/nonce`
2. User signs the nonce with their wallet (MetaMask/WalletConnect)
3. NextAuth.js verifies the signature via `/api/auth/[...nextauth]`
4. A User record is auto-created/updated in PostgreSQL on first login

### Blockchain Integration

Wagmi hooks (`useReadContract`, `useWriteContract`) connect the UI to deployed contracts:
- **StartupRegistry** — Founders register startups and create funding rounds
- **TokenizedSAFE** — Investors call `invest()` to participate in rounds
- **InvestorRegistry** — Tracks investments and cap table data

Contract addresses for Sepolia testnet are hardcoded as fallbacks in `config.ts` (lines 295–296) and should be set via env vars in production.

### Database Schema

PostgreSQL (via Prisma) stores off-chain data:
- `User` — wallet address + role (FOUNDER/INVESTOR/TALENT/ADMIN)
- `UserProfile` — name, email, bio, social links
- `Startup` — startup metadata + blockchain contract address reference
- `TeamMember` — equity allocation (in basis points), role, invitation status
- `FundingRound` — round terms linked to on-chain SAFE contract
- `Verification` — KYC/KYB status via Persona provider

### Testing

The frontend uses **Vitest** (not Jest, despite `jest.config.json` existing). Run tests with `npm run test` from `frontend/`. The `test:working` script runs a curated stable subset of tests; use `test:ci` in CI pipelines.

Blockchain uses Hardhat + Chai for contract tests (`npm run test` from `blockchain/`).

### Observability

Sentry is integrated via `@sentry/nextjs` for error tracking. The app exposes health check endpoints at `/api/health`, `/api/ready`, and `/api/status`. Structured logging is handled by Winston (`frontend/src/lib/logger.ts`) with daily log rotation.
