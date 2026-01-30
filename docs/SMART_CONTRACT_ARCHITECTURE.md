# LaunchPad Smart Contract Architecture

**Version**: 1.0  
**Date**: January 30, 2026  
**Blockchain**: Ethereum (Sepolia testnet) → Solana (Phase 3)

---

## Overview

LaunchPad's smart contract layer implements tokenized SAFEs (Simple Agreement for Future Equity) with programmable compliance, investor registries, and startup funding rounds.

---

## Contract Hierarchy

```
┌─────────────────────────────────────┐
│   LaunchPadRegistry (Master)        │
│   - Platform governance             │
│   - Fee management                  │
│   - Emergency controls              │
└──────────┬──────────────────────────┘
           │
     ┌─────┴─────┬──────────────┬──────────────┐
     │           │              │              │
┌────▼────┐ ┌───▼────┐  ┌──────▼──────┐ ┌────▼─────┐
│ Startup │ │Investor│  │ SAFEToken   │ │  Fee     │
│Registry │ │Registry│  │ Factory     │ │Collector │
└─────────┘ └────────┘  └──────┬──────┘ └──────────┘
                               │
                         ┌─────▼──────┐
                         │ SAFEToken  │
                         │ (ERC-20)   │
                         └────────────┘
```

---

## Core Contracts

### 1. LaunchPadRegistry (Master Contract)

**Purpose**: Platform governance and cross-contract coordination

**Functions:**
```solidity
contract LaunchPadRegistry is Ownable, Pausable {
    // Platform configuration
    uint256 public platformFeePercent; // e.g., 2% = 200 basis points
    address public feeCollector;
    
    // Contract registries
    mapping(address => bool) public isApprovedStartup;
    mapping(address => bool) public isVerifiedInvestor;
    mapping(address => address) public startupToSAFE;
    
    // Platform governance
    function setPlatformFee(uint256 _feePercent) external onlyOwner;
    function pausePlatform() external onlyOwner;
    function approveStartup(address _startup) external onlyOwner;
    function verifyInvestor(address _investor) external onlyOwner;
    
    // Emergency functions
    function emergencyPause() external onlyOwner;
    function recoverStuckFunds(address _token) external onlyOwner;
}
```

**Key Features:**
- ✅ Platform-wide fee configuration
- ✅ Emergency pause all contracts
- ✅ Whitelist approved startups
- ✅ Verify KYC'd investors

---

### 2. StartupRegistry

**Purpose**: Register and manage startup profiles

**Data Structure:**
```solidity
struct Startup {
    address founderAddress;
    string companyName;
    string dataRoomCID; // IPFS hash
    bool kybVerified;
    uint256 registrationDate;
    address[] safeContracts; // All SAFE rounds
}

contract StartupRegistry {
    mapping(address => Startup) public startups;
    
    // Registration
    function registerStartup(
        string memory _companyName,
        string memory _dataRoomCID
    ) external returns (address startupId);
    
    // Profile management
    function updateDataRoom(string memory _newCID) external;
    function setKYBStatus(address _startup, bool _verified) external onlyAdmin;
    
    // Query functions
    function getStartup(address _startupId) external view returns (Startup memory);
    function isKYBVerified(address _startup) external view returns (bool);
}
```

---

### 3. InvestorRegistry

**Purpose**: Manage investor KYC and accreditation status

**Data Structure:**
```solidity
enum AccreditationLevel {
    None,           // 0 - Not accredited
    Retail,         // 1 - Basic KYC only
    Accredited,     // 2 - Accredited investor
    Institutional   // 3 - Institutional investor
}

struct Investor {
    address walletAddress;
    AccreditationLevel accreditation;
    string jurisdiction; // ISO country code
    bool kycVerified;
    uint256 investmentCap; // Max investment per round
    uint256 totalInvested; // Lifetime total
}

contract InvestorRegistry {
    mapping(address => Investor) public investors;
    
    // Registration
    function registerInvestor(
        AccreditationLevel _accreditation,
        string memory _jurisdiction
    ) external returns (address investorId);
    
    // KYC management
    function setKYCStatus(address _investor, bool _verified) external onlyAdmin;
    function setAccreditation(address _investor, AccreditationLevel _level) external onlyAdmin;
    function setInvestmentCap(address _investor, uint256 _cap) external onlyAdmin;
    
    // Compliance checks
    function canInvest(address _investor, uint256 _amount) external view returns (bool);
    function isAccredited(address _investor) external view returns (bool);
}
```

---

### 4. SAFETokenFactory

**Purpose**: Create new SAFE token contracts for funding rounds

**Functions:**
```solidity
struct SAFEParameters {
    uint256 valuationCap;      // Company valuation cap
    uint256 discountRate;      // Discount rate (e.g., 20% = 2000 basis points)
    uint256 minimumInvestment; // Min per investor
    uint256 maximumRaise;      // Total funding goal
    uint256 deadline;          // Round close date
    bool proRata;              // Pro-rata rights
}

contract SAFETokenFactory {
    address public registry;
    
    event SAFECreated(
        address indexed startup,
        address indexed safeContract,
        uint256 valuationCap,
        uint256 deadline
    );
    
    // Create SAFE round
    function createSAFE(
        address _startup,
        SAFEParameters memory _params
    ) external returns (address safeContract);
    
    // Query
    function getSAFEsForStartup(address _startup) external view returns (address[] memory);
}
```

---

### 5. SAFEToken (ERC-20 Based)

**Purpose**: Tokenized SAFE representing future equity

**Core Implementation:**
```solidity
contract SAFEToken is ERC20, Ownable, Pausable {
    // SAFE parameters
    uint256 public valuationCap;
    uint256 public discountRate; // in basis points
    uint256 public minimumInvestment;
    uint256 public maximumRaise;
    uint256 public deadline;
    
    // State
    uint256 public totalRaised;
    address public startup;
    bool public converted; // True after equity conversion
    
    // Investor tracking
    mapping(address => uint256) public invested;
    address[] public investors;
    
    // Compliance
    modifier onlyVerifiedInvestor() {
        require(
            InvestorRegistry(registry).canInvest(msg.sender, 0),
            "Investor not verified"
        );
        _;
    }
    
    // Investment function
    function invest() external payable whenNotPaused onlyVerifiedInvestor {
        require(block.timestamp < deadline, "Round closed");
        require(msg.value >= minimumInvestment, "Below minimum");
        require(totalRaised + msg.value <= maximumRaise, "Exceeds cap");
        
        // Track investment
        if (invested[msg.sender] == 0) {
            investors.push(msg.sender);
        }
        invested[msg.sender] += msg.value;
        totalRaised += msg.value;
        
        // Mint SAFE tokens (1:1 with ETH for simplicity)
        _mint(msg.sender, msg.value);
        
        // Transfer to startup (minus platform fee)
        uint256 fee = (msg.value * platformFeePercent) / 10000;
        payable(feeCollector).transfer(fee);
        payable(startup).transfer(msg.value - fee);
        
        emit Invested(msg.sender, msg.value);
    }
    
    // Transfer restrictions
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        if (from != address(0)) { // Skip minting
            require(!converted, "SAFE converted, transfers locked");
            require(
                InvestorRegistry(registry).canInvest(to, 0),
                "Recipient not verified"
            );
        }
        super._beforeTokenTransfer(from, to, amount);
    }
    
    // Equity conversion (triggered by Series A)
    function convertToEquity(uint256 _seriesAValuation) external onlyOwner {
        require(!converted, "Already converted");
        converted = true;
        
        // Calculate conversion based on valuation cap or discount
        // Implementation depends on term sheet specifics
        
        emit Converted(_seriesAValuation, block.timestamp);
    }
    
    // Refund if round fails
    function refund() external {
        require(block.timestamp > deadline, "Round not ended");
        require(totalRaised < minimumRaise, "Round successful");
        
        uint256 refundAmount = invested[msg.sender];
        require(refundAmount > 0, "No investment");
        
        invested[msg.sender] = 0;
        _burn(msg.sender, refundAmount);
        payable(msg.sender).transfer(refundAmount);
        
        emit Refunded(msg.sender, refundAmount);
    }
}
```

**Key Features:**
- ✅ Tokenized SAFE (ERC-20 compatible)
- ✅ Automatic platform fee collection
- ✅ Transfer restrictions (only verified investors)
- ✅ Equity conversion mechanism
- ✅ Refund logic if minimum not met
- ✅ Pro-rata rights tracking

---

### 6. FeeCollector

**Purpose**: Collect and distribute platform fees

```solidity
contract FeeCollector {
    address public treasury;
    
    mapping(address => uint256) public collectedFees;
    
    function receive() external payable {
        collectedFees[msg.sender] += msg.value;
    }
    
    function withdraw() external onlyOwner {
        payable(treasury).transfer(address(this).balance);
    }
}
```

---

## Data Flow

### Investment Flow

```
1. Investor registers in InvestorRegistry
   └─> Completes KYC via Persona
       └─> Admin calls setKYCStatus(investor, true)

2. Startup registers in StartupRegistry
   └─> Completes KYB
       └─> Admin calls setKYBStatus(startup, true)

3. Startup creates SAFE round via SAFETokenFactory
   └─> New SAFEToken contract deployed
       └─> Parameters set (valuation cap, discount, etc.)

4. Investor calls SAFEToken.invest() with ETH
   ├─> Compliance checks pass
   ├─> SAFE tokens minted to investor
   ├─> Platform fee deducted and sent to FeeCollector
   └─> Remaining funds sent to startup

5. Round completes
   ├─> Success: Startup can trigger convertToEquity()
   └─> Failure: Investors can call refund()
```

---

## Security Considerations

### 1. Reentrancy Protection

```solidity
// Use OpenZeppelin's ReentrancyGuard
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SAFEToken is ERC20, ReentrancyGuard {
    function invest() external payable nonReentrant {
        // Safe from reentrancy attacks
    }
}
```

### 2. Access Control

```solidity
// Role-based access control
import "@openzeppelin/contracts/access/AccessControl.sol";

contract LaunchPadRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant KYC_ROLE = keccak256("KYC_ROLE");
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function setKYCStatus(address _investor, bool _verified) 
        external 
        onlyRole(KYC_ROLE) 
    {
        // Only KYC admin can verify
    }
}
```

### 3. Upgrade Mechanism

```solidity
// Use UUPS upgradeable pattern
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract LaunchPadRegistry is UUPSUpgradeable {
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyOwner 
    {}
}
```

---

## Gas Optimization

### Strategies

1. **Batch Operations**: Group investor verifications
2. **Tight Variable Packing**: 
   ```solidity
   struct Investor {
       address walletAddress;        // 20 bytes
       uint96 investmentCap;         // 12 bytes (fits in same slot)
       uint8 accreditation;          // 1 byte
       bool kycVerified;             // 1 byte
   } // Total: 34 bytes = 2 storage slots instead of 4
   ```
3. **Immutable Variables**: Use `immutable` for values set in constructor
4. **Events over Storage**: Emit events for historical data instead of storing

---

## Testing Requirements

### Unit Tests
- [ ] Each contract function isolated
- [ ] Edge cases (zero amounts, max uint256, etc.)
- [ ] Access control enforcement
- [ ] Event emissions

### Integration Tests
- [ ] Full investment flow
- [ ] Multi-investor scenarios
- [ ] Refund mechanics
- [ ] Conversion triggers

### Security Tests
- [ ] Reentrancy attack prevention
- [ ] Integer overflow/underflow (should be safe with Solidity 0.8+)
- [ ] Unauthorized access attempts
- [ ] Front-running scenarios

---

## Deployment Plan

### Testnet (Sepolia)

```bash
# 1. Deploy core contracts
npx hardhat run scripts/deploy-registry.ts --network sepolia
npx hardhat run scripts/deploy-startupRegistry.ts --network sepolia
npx hardhat run scripts/deploy-investorRegistry.ts --network sepolia
npx hardhat run scripts/deploy-safeFactory.ts --network sepolia

# 2. Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>

# 3. Configure relationships
npx hardhat run scripts/configure-contracts.ts --network sepolia
```

### Mainnet Deployment (Month 3)
- After security audit
- Multi-sig wallet as owner
- Timelock for upgrades

---

**Next Steps**: Begin implementing StartupRegistry and InvestorRegistry contracts
