// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title InvestorRegistry
 * @notice Manages investor KYC status and accreditation levels
 * @dev Upgradeable contract using UUPS pattern
 */
contract InvestorRegistry is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant KYC_ROLE = keccak256("KYC_ROLE");

    enum AccreditationLevel {
        None,           // 0 - Not accredited
        Retail,         // 1 - Basic KYC only
        Accredited,     // 2 - Accredited investor
        Institutional   // 3 - Institutional investor
    }

    struct Investor {
        bool kycVerified;
        AccreditationLevel accreditation;
        string jurisdiction;        // ISO country code
        uint256 investmentCap;      // Max investment per round (0 = unlimited)
        uint256 totalInvested;      // Lifetime total invested
        uint256 kycTimestamp;       // When KYC was completed
        uint256 kycExpiry;          // When KYC expires
        bool isActive;              // Can be deactivated by admin
    }

    // Investor address => Investor data
    mapping(address => Investor) private investors;
    
    // Track all registered investor addresses
    address[] private investorList;
    mapping(address => bool) private isRegistered;

    // Statistics
    uint256 public totalInvestors;
    uint256 public totalAccredited;

    // Events
    event InvestorRegistered(address indexed investor, string jurisdiction);
    event KYCStatusUpdated(address indexed investor, bool verified, uint256 expiry);
    event AccreditationUpdated(address indexed investor, AccreditationLevel level);
    event InvestmentCapUpdated(address indexed investor, uint256 cap);
    event InvestmentRecorded(address indexed investor, uint256 amount);
    event InvestorDeactivated(address indexed investor);
    event InvestorReactivated(address indexed investor);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(KYC_ROLE, msg.sender);
    }

    /**
     * @notice Register a new investor
     * @param _jurisdiction ISO country code
     */
    function registerInvestor(string memory _jurisdiction) external {
        require(!isRegistered[msg.sender], "Already registered");
        require(bytes(_jurisdiction).length == 2, "Invalid jurisdiction code");

        investors[msg.sender] = Investor({
            kycVerified: false,
            accreditation: AccreditationLevel.None,
            jurisdiction: _jurisdiction,
            investmentCap: 0,
            totalInvested: 0,
            kycTimestamp: 0,
            kycExpiry: 0,
            isActive: true
        });

        investorList.push(msg.sender);
        isRegistered[msg.sender] = true;
        totalInvestors++;

        emit InvestorRegistered(msg.sender, _jurisdiction);
    }

    /**
     * @notice Set KYC verification status (KYC_ROLE only)
     * @param _investor Investor address
     * @param _verified KYC status
     * @param _validityPeriod How long KYC is valid (in seconds)
     */
    function setKYCStatus(
        address _investor,
        bool _verified,
        uint256 _validityPeriod
    ) external onlyRole(KYC_ROLE) {
        require(isRegistered[_investor], "Investor not registered");

        investors[_investor].kycVerified = _verified;
        
        if (_verified) {
            investors[_investor].kycTimestamp = block.timestamp;
            investors[_investor].kycExpiry = block.timestamp + _validityPeriod;
        } else {
            investors[_investor].kycTimestamp = 0;
            investors[_investor].kycExpiry = 0;
        }

        emit KYCStatusUpdated(_investor, _verified, investors[_investor].kycExpiry);
    }

    /**
     * @notice Set accreditation level (KYC_ROLE only)
     * @param _investor Investor address  
     * @param _level Accreditation level
     */
    function setAccreditation(
        address _investor,
        AccreditationLevel _level
    ) external onlyRole(KYC_ROLE) {
        require(isRegistered[_investor], "Investor not registered");
        
        AccreditationLevel oldLevel = investors[_investor].accreditation;
        investors[_investor].accreditation = _level;

        // Update accredited count
        if (oldLevel < AccreditationLevel.Accredited && _level >= AccreditationLevel.Accredited) {
            totalAccredited++;
        } else if (oldLevel >= AccreditationLevel.Accredited && _level < AccreditationLevel.Accredited) {
            totalAccredited--;
        }

        emit AccreditationUpdated(_investor, _level);
    }

    /**
     * @notice Set investment cap for an investor (ADMIN_ROLE only)
     * @param _investor Investor address
     * @param _cap Maximum investment amount (0 = unlimited)
     */
    function setInvestmentCap(
        address _investor,
        uint256 _cap
    ) external onlyRole(ADMIN_ROLE) {
        require(isRegistered[_investor], "Investor not registered");
        
        investors[_investor].investmentCap = _cap;
        emit InvestmentCapUpdated(_investor, _cap);
    }

    /**
     * @notice Record an investment (called by SAFE contracts)
     * @param _investor Investor address
     * @param _amount Investment amount
     */
    function recordInvestment(
        address _investor,
        uint256 _amount
    ) external onlyRole(ADMIN_ROLE) {
        require(isRegistered[_investor], "Investor not registered");
        require(canInvest(_investor, _amount), "Investment not allowed");

        investors[_investor].totalInvested += _amount;
        emit InvestmentRecorded(_investor, _amount);
    }

    /**
     * @notice Deactivate an investor (ADMIN_ROLE only)
     * @param _investor Investor address
     */
    function deactivateInvestor(address _investor) external onlyRole(ADMIN_ROLE) {
        require(isRegistered[_investor], "Investor not registered");
        require(investors[_investor].isActive, "Already deactivated");

        investors[_investor].isActive = false;
        emit InvestorDeactivated(_investor);
    }

    /**
     * @notice Reactivate an investor (ADMIN_ROLE only)
     * @param _investor Investor address
     */
    function reactivateInvestor(address _investor) external onlyRole(ADMIN_ROLE) {
        require(isRegistered[_investor], "Investor not registered");
        require(!investors[_investor].isActive, "Already active");

        investors[_investor].isActive = true;
        emit InvestorReactivated(_investor);
    }

    /**
     * @notice Check if investor can invest a specific amount
     * @param _investor Investor address
     * @param _amount Investment amount
     * @return bool Can invest or not
     */
    function canInvest(address _investor, uint256 _amount) public view returns (bool) {
        if (!isRegistered[_investor]) return false;
        
        Investor memory inv = investors[_investor];
        
        // Must be active
        if (!inv.isActive) return false;
        
        // Must have valid KYC
        if (!inv.kycVerified) return false;
        if (block.timestamp > inv.kycExpiry) return false;
        
        // Check investment cap
        if (inv.investmentCap > 0 && inv.totalInvested + _amount > inv.investmentCap) {
            return false;
        }
        
        return true;
    }

    /**
     * @notice Check if investor is accredited
     * @param _investor Investor address
     * @return bool Is accredited or not
     */
    function isAccredited(address _investor) external view returns (bool) {
        return investors[_investor].accreditation >= AccreditationLevel.Accredited;
    }

    /**
     * @notice Get investor details
     * @param _investor Investor address
     * @return Investor struct
     */
    function getInvestor(address _investor) external view returns (Investor memory) {
        require(isRegistered[_investor], "Investor not registered");
        return investors[_investor];
    }

    /**
     * @notice Get all investor addresses (paginated)
     * @param _offset Starting index
     * @param _limit Number of results
     * @return addresses Array of investor addresses
     */
    function getInvestors(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (address[] memory addresses) 
    {
        require(_offset < investorList.length, "Offset out of bounds");
        
        uint256 end = _offset + _limit;
        if (end > investorList.length) {
            end = investorList.length;
        }
        
        uint256 resultLength = end - _offset;
        addresses = new address[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            addresses[i] = investorList[_offset + i];
        }
        
        return addresses;
    }

    /**
     * @notice Check if address is registered
     * @param _investor Investor address
     * @return bool Is registered or not
     */
    function isInvestorRegistered(address _investor) external view returns (bool) {
        return isRegistered[_investor];
    }

    /**
     * @dev Required by UUPS pattern
     */
    function _authorizeUpgrade(address newImplementation) 
        internal 
        onlyRole(ADMIN_ROLE) 
        override 
    {}
}
