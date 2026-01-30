// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IInvestorRegistry {
    function isVerified(address investor) external view returns (bool);
    function isAccredited(address investor) external view returns (bool);
}

contract TokenizedSAFE is 
    Initializable, 
    ERC20Upgradeable, 
    AccessControlUpgradeable, 
    PausableUpgradeable, 
    ReentrancyGuardUpgradeable, 
    UUPSUpgradeable 
{
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    IERC20 public usdcToken;
    IInvestorRegistry public investorRegistry;

    uint256 public valuationCap;
    uint256 public discountRate; // In basis points (e.g., 2000 = 20%)
    uint256 public minInvestment;
    uint256 public maxInvestment;
    uint256 public roundEndTime;
    address public founderAddress;

    event InvestmentReceived(address indexed investor, uint256 amount, uint256 tokensMinted);
    event FundsWithdrawn(address indexed to, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name,
        string memory symbol,
        address _usdcToken,
        address _investorRegistry,
        address _founder,
        uint256 _valuationCap,
        uint256 _discountRate,
        uint256 _minInvestment,
        uint256 _maxInvestment,
        uint256 _roundDuration
    ) public initializer {
        __ERC20_init(name, symbol);
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        usdcToken = IERC20(_usdcToken);
        investorRegistry = IInvestorRegistry(_investorRegistry);
        founderAddress = _founder;
        valuationCap = _valuationCap;
        discountRate = _discountRate;
        minInvestment = _minInvestment;
        maxInvestment = _maxInvestment;
        roundEndTime = block.timestamp + _roundDuration;
    }

    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function invest(uint256 amount) public nonReentrant whenNotPaused {
        require(block.timestamp <= roundEndTime, "Round ended");
        require(amount >= minInvestment, "Below min investment");
        require(balanceOf(msg.sender) + amount <= maxInvestment, "Exceeds max investment");
        
        // Compliance Checks
        require(investorRegistry.isVerified(msg.sender), "Investor not verified");
        // require(investorRegistry.isAccredited(msg.sender), "Investor not accredited"); // Optional based on config

        // Transfer USDC
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Mint SAFE tokens (1:1 with USDC for simplicity in this MVP, logical conversion happens at equity event)
        _mint(msg.sender, amount);

        emit InvestmentReceived(msg.sender, amount, amount);
    }

    function withdrawFunds() public nonReentrant onlyRole(ADMIN_ROLE) {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");
        require(usdcToken.transfer(founderAddress, balance), "Transfer failed");
        
        emit FundsWithdrawn(founderAddress, balance);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    // Override to restrict transfers if needed (for SAFE compliance, transfers usually restricted)
    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0) && to != address(0)) {
            // Allow transfers only if admin approves or specific conditions met
            // For MVP, maybe restrict all transfers except mint/burn?
            // require(hasRole(ADMIN_ROLE, msg.sender), "Transfers restricted");
        }
        super._update(from, to, value);
    }
}
