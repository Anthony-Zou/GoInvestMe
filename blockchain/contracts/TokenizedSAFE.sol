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

    // Protocol fee config
    address public protocolTreasury;
    uint256 public feeBps; // basis points, e.g. 100 = 1%

    // Milestones
    struct Milestone {
        string description;
        uint256 amount;
        bool isCompleted;
        bool isVerified;
        string proofOfWork;
    }

    mapping(uint256 => Milestone) public milestones;
    uint256 public milestoneCount;

    event InvestmentReceived(address indexed investor, uint256 amount, uint256 tokensMinted);
    event FeeCollected(address indexed treasury, uint256 amount);
    event FundsWithdrawn(address indexed to, uint256 amount);
    event MilestoneCreated(uint256 indexed id, string description, uint256 amount);
    event MilestoneVerified(uint256 indexed id);
    event MilestoneWithdrawn(uint256 indexed id, uint256 amount);

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
        address _protocolAdmin, // New parameter
        uint256 _valuationCap,
        uint256 _discountRate,
        uint256 _minInvestment,
        uint256 _maxInvestment,
        uint256 _roundDuration,
        address _protocolTreasury,
        uint256 _feeBps
    ) public initializer {
        __ERC20_init(name, symbol);
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Registry
        _grantRole(DEFAULT_ADMIN_ROLE, _protocolAdmin); // Protocol Admin (Deployer/Multisig)
        _grantRole(UPGRADER_ROLE, _protocolAdmin);
        _grantRole(ADMIN_ROLE, _founder); // Founder gets regular admin

        usdcToken = IERC20(_usdcToken);
        investorRegistry = IInvestorRegistry(_investorRegistry);
        founderAddress = _founder;
        valuationCap = _valuationCap;
        discountRate = _discountRate;
        minInvestment = _minInvestment;
        maxInvestment = _maxInvestment;
        roundEndTime = block.timestamp + _roundDuration;
        protocolTreasury = _protocolTreasury;
        feeBps = _feeBps;
    }

    /**
     * @notice Update protocol fee configuration (Protocol Admin only)
     * @param _treasury Address to receive protocol fees
     * @param _feeBps Fee in basis points (max 1000 = 10%)
     */
    function setFeeConfig(address _treasury, uint256 _feeBps) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_feeBps <= 1000, "Fee exceeds maximum");
        protocolTreasury = _treasury;
        feeBps = _feeBps;
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

        // Transfer full amount from investor
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Deduct protocol fee and send to treasury
        uint256 fee = 0;
        if (feeBps > 0 && protocolTreasury != address(0)) {
            fee = (amount * feeBps) / 10000;
            require(usdcToken.transfer(protocolTreasury, fee), "Fee transfer failed");
            emit FeeCollected(protocolTreasury, fee);
        }

        // Mint SAFE tokens 1:1 with net investment held in contract
        uint256 netAmount = amount - fee;
        _mint(msg.sender, netAmount);

        emit InvestmentReceived(msg.sender, amount, netAmount);
    }

    /**
     * @notice Create a new milestone (Founder only)
     * @param description Brief description of the deliverable
     * @param amount Amount to unlock upon completion
     */
    function createMilestone(string memory description, uint256 amount) public onlyRole(ADMIN_ROLE) {
        uint256 id = milestoneCount++;
        milestones[id] = Milestone({
            description: description,
            amount: amount,
            isCompleted: false,
            isVerified: false,
            proofOfWork: ""
        });
        emit MilestoneCreated(id, description, amount);
    }

    /**
     * @notice Submit proof for a milestone (Founder)
     * @param id Milestone ID
     * @param proof Link to evidence (GitHub PR, Loom, etc.)
     */
    function submitMilestoneProof(uint256 id, string memory proof) public onlyRole(ADMIN_ROLE) {
        require(id < milestoneCount, "Invalid ID");
        require(!milestones[id].isCompleted, "Already completed");
        
        milestones[id].isCompleted = true; // Marked as completed by founder, pending verification
        milestones[id].proofOfWork = proof;
    }

    /**
     * @notice Verify a milestone (Protocol Admin / Auditor only)
     * @dev For MVP, we allow the Factory owner (UPGRADER_ROLE/DEFAULT_ADMIN) or a specific AUDITOR to verify.
     *      Since msg.sender in initialize (the Registry) has DEFAULT_ADMIN_ROLE, it can manage this.
     *      Ideally, we'd have a separate AUDITOR_ROLE.
     */
    function verifyMilestone(uint256 id) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(id < milestoneCount, "Invalid ID");
        require(milestones[id].isCompleted, "Not marked completed");
        require(!milestones[id].isVerified, "Already verified");

        milestones[id].isVerified = true;
        emit MilestoneVerified(id);
    }

    /**
     * @notice Withdraw funds for a verified milestone (Founder)
     */
    function withdrawMilestoneFunds(uint256 id) public nonReentrant onlyRole(ADMIN_ROLE) {
        require(id < milestoneCount, "Invalid ID");
        Milestone storage m = milestones[id];
        require(m.isVerified, "Milestone not verified");
        require(m.amount > 0, "Already withdrawn");

        uint256 amount = m.amount;
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance >= amount, "Insufficient funds");

        m.amount = 0; // Prevent re-entrancy / double withdrawal
        
        require(usdcToken.transfer(founderAddress, amount), "Transfer failed");
        emit MilestoneWithdrawn(id, amount);
    }

    // Deprecated: withdrawFunds replaced by milestone-based system.
    // Kept but commented out or restricted to emergency only?
    // Let's restrict it to DEFAULT_ADMIN_ROLE (Protocol) for emergency drainage/recovery.
    function emergencyWithdraw(address to) public nonReentrant onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No funds");
        require(usdcToken.transfer(to, balance), "Transfer failed");
        emit FundsWithdrawn(to, balance);
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
