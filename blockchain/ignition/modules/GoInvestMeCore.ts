import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Hardhat Ignition deployment module for GoInvestMeCore
 * 
 * This module defines the deployment configuration for the GoInvestMeCore contract.
 * Hardhat Ignition handles deployment verification, retries, and state management.
 */

const GoInvestMeCoreModule = buildModule("GoInvestMeCoreModule", (m) => {
  // Deploy the GoInvestMeCore contract
  // Constructor takes no parameters (owner is set to msg.sender automatically)
  const goInvestMeCore = m.contract("GoInvestMeCore", []);

  return { contract: goInvestMeCore };
});

export default GoInvestMeCoreModule;
