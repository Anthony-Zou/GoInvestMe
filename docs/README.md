# Go Invest Me (GIM) - Smart Contract

Blockchain-based investment platform for entrepreneurs to create personal tokens and receive instant capital from investors.

## 🎯 Core Features

### For Entrepreneurs:
- ✅ Create personal investment tokens (coins) with custom parameters
- ✅ Set supply (100 - 10M coins) and price (0.0001 - 100 ETH)
- ✅ Receive ETH instantly when investors buy coins
- ✅ Update project description and website anytime
- ✅ Pause/unpause coin sales
- ✅ View cap table with ownership percentages

### For Investors:
- ✅ Browse all entrepreneur projects with pagination
- ✅ Buy coins directly (ETH transfers instantly to entrepreneur)
- ✅ Track investments across multiple entrepreneurs
- ✅ View ownership percentages in real-time
- ✅ Automatic excess payment refunds

### Admin Controls:
- ✅ Emergency pause mechanism
- ✅ Contract ownership management
- ✅ Emergency fund withdrawal (when paused)

## 📊 Contract Information

- **Version:** 2.1.0-Professional
- **Solidity:** 0.8.28
- **License:** MIT
- **Security:** OpenZeppelin (ReentrancyGuard, Pausable, Ownable)
- **Tests:** 82/82 passing (100% coverage)
- **Network:** Sepolia Testnet (ready for deployment)

## 🚀 Core Functions

### Entrepreneur Functions
```solidity
createCoin(string projectName, string description, string websiteUrl, uint256 totalSupply, uint256 pricePerCoin)
updateCoinInfo(string newDescription, string newWebsiteUrl)
setCoinActive(bool active)
```

### Investor Functions
```solidity
buyCoin(address entrepreneur, uint256 amount) payable
getInvestment(address investor, address entrepreneur) view returns (uint256)
getOwnershipPercentage(address investor, address entrepreneur) view returns (uint256)
```

### Discovery Functions
```solidity
getAllEntrepreneurs() view returns (address[])
getCoinInfo(address entrepreneur) view returns (...)
getCapTableSummary(address entrepreneur) view returns (uint256 soldPct, uint256 availablePct, uint256 totalRaised)
```

## 🔧 Development

```bash
npm install          # Install dependencies
npm run compile      # Compile contracts
npm test            # Run 82 tests (100% passing)
npm run deploy:sepolia  # Deploy to Sepolia testnet
```

## 📚 Documentation

- **Test Report:** `TEST_REPORT.md` - Full test coverage analysis
- **Development Plan:** `DEVELOPMENT_PLAN.md` - Project roadmap
- **Security:** OpenZeppelin audited libraries

## 🔒 Security

- ReentrancyGuard prevents reentrancy attacks
- Pausable emergency stop mechanism  
- Ownable access control
- Checks-Effects-Interactions pattern
- Comprehensive input validation

## 📄 License

MIT License
