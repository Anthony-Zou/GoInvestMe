// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockInvestorRegistry {
    mapping(address => bool) public verified;
    mapping(address => bool) public accredited;

    function setVerified(address investor, bool status) external {
        verified[investor] = status;
    }

    function setAccredited(address investor, bool status) external {
        accredited[investor] = status;
    }

    function isVerified(address investor) external view returns (bool) {
        return verified[investor];
    }

    function isAccredited(address investor) external view returns (bool) {
        return accredited[investor];
    }
}
