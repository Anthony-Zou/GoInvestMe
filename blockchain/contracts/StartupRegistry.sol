// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

interface ITokenizedSAFE {
    function initialize(
        string memory name,
        string memory symbol,
        address _usdcToken,
        address _investorRegistry,
        address _founder,
        address _protocolAdmin,
        uint256 _valuationCap,
        uint256 _discountRate,
        uint256 _minInvestment,
        uint256 _maxInvestment,
        uint256 _roundDuration
    ) external;
}

/**
 * @title StartupRegistry
 * @notice Manages startup profiles and KYB verification
 * @dev Upgradeable contract using UUPS pattern
 */
contract StartupRegistry is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant KYB_ROLE = keccak256("KYB_ROLE");

    struct Startup {
        address founderAddress;
        string companyName;
        string dataRoomCID;         // IPFS hash for data room
        bool kybVerified;
        uint256 registrationDate;
        uint256 kybTimestamp;
        bool isActive;
        address[] safeContracts;    // All SAFE round contracts
    }

    // Startup ID => Startup data
    mapping(address => Startup) private startups;
    
    // Track all registered startup addresses
    address[] private startupList;
    mapping(address => bool) private isRegistered;
    
    // Company name => startup address (for uniqueness)
    mapping(bytes32 => address) private nameToStartup;

    // Statistics
    uint256 public totalStartups;
    uint256 public totalVerified;

    // Events
    event StartupRegistered(
        address indexed startupId,
        address indexed founder,
        string companyName
    );
    event KYBStatusUpdated(address indexed startupId, bool verified);
    event DataRoomUpdated(address indexed startupId, string newCID);
    event SAFEContractAdded(address indexed startupId, address indexed safeContract);
    event StartupDeactivated(address indexed startupId);
    event StartupReactivated(address indexed startupId);
    event RoundCreated(address indexed startupId, address indexed roundAddress, uint256 cap);
    event ProtocolConfigUpdated(address safeImpl, address usdc, address investorReg);

    // Factory Configuration
    address public safeImplementation;
    address public usdcToken;
    address public investorRegistry;
    address public protocolAdmin; // Protocol controller

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(KYB_ROLE, msg.sender);
    }

    /**
     * @notice Register a new startup
     * @param _companyName Company name
     * @param _dataRoomCID IPFS hash for data room
     * @return startupId Unique startup identifier
     */
    function registerStartup(
        string memory _companyName,
        string memory _dataRoomCID
    ) external returns (address startupId) {
        require(bytes(_companyName).length > 0, "Company name required");
        require(bytes(_companyName).length <= 100, "Company name too long");
        
        bytes32 nameHash = keccak256(abi.encodePacked(_companyName));
        require(nameToStartup[nameHash] == address(0), "Company name already exists");

        // Generate unique startup ID based on founder + company name + timestamp
        startupId = address(uint160(uint256(keccak256(abi.encodePacked(
            msg.sender,
            _companyName,
            block.timestamp,
            totalStartups
        )))));

        require(!isRegistered[startupId], "ID collision");

        startups[startupId] = Startup({
            founderAddress: msg.sender,
            companyName: _companyName,
            dataRoomCID: _dataRoomCID,
            kybVerified: false,
            registrationDate: block.timestamp,
            kybTimestamp: 0,
            isActive: true,
            safeContracts: new address[](0)
        });

        startupList.push(startupId);
        isRegistered[startupId] = true;
        nameToStartup[nameHash] = startupId;
        totalStartups++;

        emit StartupRegistered(startupId, msg.sender, _companyName);
        
        return startupId;
    }

    /**
     * @notice Set KYB verification status (KYB_ROLE only)
     * @param _startupId Startup identifier
     * @param _verified KYB status
     */
    function setKYBStatus(
        address _startupId,
        bool _verified
    ) external onlyRole(KYB_ROLE) {
        require(isRegistered[_startupId], "Startup not registered");

        bool wasVerified = startups[_startupId].kybVerified;
        startups[_startupId].kybVerified = _verified;
        
        if (_verified && !wasVerified) {
            startups[_startupId].kybTimestamp = block.timestamp;
            totalVerified++;
        } else if (!_verified && wasVerified) {
            startups[_startupId].kybTimestamp = 0;
            totalVerified--;
        }

        emit KYBStatusUpdated(_startupId, _verified);
    }

    /**
     * @notice Update data room CID (founder only)
     * @param _startupId Startup identifier
     * @param _newCID New IPFS hash
     */
    function updateDataRoom(
        address _startupId,
        string memory _newCID
    ) external {
        require(isRegistered[_startupId], "Startup not registered");
        require(startups[_startupId].founderAddress == msg.sender, "Not founder");
        require(bytes(_newCID).length > 0, "CID required");

        startups[_startupId].dataRoomCID = _newCID;
        emit DataRoomUpdated(_startupId, _newCID);
    }

    /**
     * @notice Add a SAFE contract to startup's list (ADMIN_ROLE only)
     * @param _startupId Startup identifier
     * @param _safeContract SAFE contract address
     */
    function addSAFEContract(
        address _startupId,
        address _safeContract
    ) external onlyRole(ADMIN_ROLE) {
        require(isRegistered[_startupId], "Startup not registered");
        require(_safeContract != address(0), "Invalid SAFE contract");

        startups[_startupId].safeContracts.push(_safeContract);
        emit SAFEContractAdded(_startupId, _safeContract);
    }

    /**
     * @notice Deactivate a startup (ADMIN_ROLE only)
     * @param _startupId Startup identifier
     */
    function deactivateStartup(address _startupId) external onlyRole(ADMIN_ROLE) {
        require(isRegistered[_startupId], "Startup not registered");
        require(startups[_startupId].isActive, "Already deactivated");

        startups[_startupId].isActive = false;
        emit StartupDeactivated(_startupId);
    }

    /**
     * @notice Reactivate a startup (ADMIN_ROLE only)
     * @param _startupId Startup identifier
     */
    function reactivateStartup(address _startupId) external onlyRole(ADMIN_ROLE) {
        require(isRegistered[_startupId], "Startup not registered");
        require(!startups[_startupId].isActive, "Already active");

        startups[_startupId].isActive = true;
        emit StartupReactivated(_startupId);
    }

    /**
     * @notice Check if startup is verified
     * @param _startupId Startup identifier
     * @return bool Is verified or not
     */
    function isKYBVerified(address _startupId) external view returns (bool) {
        return startups[_startupId].kybVerified;
    }

    /**
     * @notice Get startup details
     * @param _startupId Startup identifier
     * @return Startup struct
     */
    function getStartup(address _startupId) external view returns (Startup memory) {
        require(isRegistered[_startupId], "Startup not registered");
        return startups[_startupId];
    }

    /**
     * @notice Get startup's SAFE contracts
     * @param _startupId Startup identifier
     * @return addresses Array of SAFE contract addresses
     */
    function getSAFEContracts(address _startupId) 
        external 
        view 
        returns (address[] memory) 
    {
        require(isRegistered[_startupId], "Startup not registered");
        return startups[_startupId].safeContracts;
    }

    /**
     * @notice Get all startup addresses (paginated)
     * @param _offset Starting index
     * @param _limit Number of results
     * @return addresses Array of startup addresses
     */
    function getStartups(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (address[] memory addresses) 
    {
        require(_offset < startupList.length, "Offset out of bounds");
        
        uint256 end = _offset + _limit;
        if (end > startupList.length) {
            end = startupList.length;
        }
        
        uint256 resultLength = end - _offset;
        addresses = new address[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            addresses[i] = startupList[_offset + i];
        }
        
        return addresses;
    }

    /**
     * @notice Get startups by founder
     * @param _founder Founder address
     * @return startupIds Array of startup IDs
     */
    function getStartupsByFounder(address _founder) 
        external 
        view 
        returns (address[] memory startupIds) 
    {
        uint256 count = 0;
        
        // Count startups by founder
        for (uint256 i = 0; i < startupList.length; i++) {
            if (startups[startupList[i]].founderAddress == _founder) {
                count++;
            }
        }
        
        // Populate result array
        startupIds = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < startupList.length; i++) {
            if (startups[startupList[i]].founderAddress == _founder) {
                startupIds[index] = startupList[i];
                index++;
            }
        }
        
        return startupIds;
    }

    /**
     * @notice Check if startup is registered
     * @param _startupId Startup identifier
     * @return bool Is registered or not
     */
    function isStartupRegistered(address _startupId) external view returns (bool) {
        return isRegistered[_startupId];
    }

    /**
     * @notice Get startup ID by company name
     * @param _companyName Company name
     * @return startupId Startup identifier (address(0) if not found)
     */
    function getStartupByName(string memory _companyName) 
        external 
        view 
        returns (address) 
    {
        bytes32 nameHash = keccak256(abi.encodePacked(_companyName));
        return nameToStartup[nameHash];
    }

    /**
     * @notice Configure protocol addresses (ADMIN_ROLE only)
     */
    function setProtocolConfig(
        address _safeImplementation,
        address _usdcToken,
        address _investorRegistry
    ) external onlyRole(ADMIN_ROLE) {
        safeImplementation = _safeImplementation;
        usdcToken = _usdcToken;
        investorRegistry = _investorRegistry;
        protocolAdmin = msg.sender; // The admin calling this becomes the SAFE Protocol Admin
        emit ProtocolConfigUpdated(_safeImplementation, _usdcToken, _investorRegistry);
    }

    /**
     * @notice Create a new funding round (SAFE)
     * @param _startupId Startup identifier
     * @param _valuationCap Valuation cap
     * @param _discountRate Discount rate (bps)
     * @param _minInvestment Min investment
     * @param _maxInvestment Max investment
     * @param _roundDuration Duration in seconds
     */
    function createRound(
        address _startupId,
        uint256 _valuationCap,
        uint256 _discountRate,
        uint256 _minInvestment,
        uint256 _maxInvestment,
        uint256 _roundDuration
    ) external returns (address roundAddress) {
        require(isRegistered[_startupId], "Startup not registered");
        require(startups[_startupId].founderAddress == msg.sender, "Not founder");
        require(startups[_startupId].isActive, "Startup not active");
        require(startups[_startupId].kybVerified, "KYB not verified");
        require(safeImplementation != address(0), "SAFE impl not set");

        // Clone the SAFE implementation
        roundAddress = Clones.clone(safeImplementation);

        // Derive name/symbol (e.g., "Company SAFE", "SAFE-CO")
        string memory name = string(abi.encodePacked(startups[_startupId].companyName, " SAFE"));
        string memory symbol = "SAFE"; // Simplified for now

        // Initialize the new SAFE
        // Initialize the new SAFE
        ITokenizedSAFE(roundAddress).initialize(
            name,
            symbol,
            usdcToken,
            investorRegistry,
            msg.sender, // Founder
            protocolAdmin, // Protocol Admin
            _valuationCap,
            _discountRate,
            _minInvestment,
            _maxInvestment,
            _roundDuration
        );

        // Track the round
        startups[_startupId].safeContracts.push(roundAddress);
        emit SAFEContractAdded(_startupId, roundAddress);
        emit RoundCreated(_startupId, roundAddress, _valuationCap);

        return roundAddress;
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
