// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @notice Testnet-only: always returns verified/accredited for everyone.
 * Deploy once and use as investorRegistry in setProtocolConfig.
 * Never use in production.
 */
contract TestnetVerifier {
    function isVerified(address) external pure returns (bool) { return true; }
    function isAccredited(address) external pure returns (bool) { return true; }
    function recordInvestment(address, uint256) external {}
    function registerInvestor(string memory) external {}
}
