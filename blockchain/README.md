# GoInvestMe - Blockchain Smart Contracts

This folder contains all blockchain-related components for the GoInvestMe platform.

## Structure
- **contracts/**: Solidity smart contracts
- **test/**: Comprehensive test suites
- **scripts/**: Deployment and utility scripts
- **ignition/**: Hardhat Ignition deployment modules
- **artifacts/**: Compiled contract artifacts
- **cache/**: Build cache files

## Quick Start
```bash
# From root directory
npm run compile    # Compile contracts
npm run test      # Run all tests
npm run deploy:sepolia  # Deploy to Sepolia testnet
```

## Contract Information
- **Contract**: GoInvestMeCore v2.1.0-Professional
- **Deployed**: Sepolia testnet at 0x8b23a938d1a52588de989a8967a51e2dde0f494f
- **Security**: Fully audited, 117 tests passing
- **Features**: Token creation, investment handling, cap table tracking

## Testing
- Unit tests: 82 tests
- Integration tests: 10 tests  
- Security tests: 13 tests
- Exploit tests: 12 tests
- **Total**: 117 tests, all passing