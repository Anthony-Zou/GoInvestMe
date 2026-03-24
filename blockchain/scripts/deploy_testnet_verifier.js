/**
 * Deploys TestnetVerifier and reconfigures StartupRegistry + creates fresh SAFE rounds.
 * Run: npx hardhat run scripts/deploy_testnet_verifier.js --network sepolia
 */
import hre from "hardhat";
const { ethers } = hre;

const STARTUP_REGISTRY = "0xE4a56B8F0EEabDf2b10da8f04bBeE249bC1411b9";
const MOCK_USDC        = "0xb24a0E87A06f6Aa72A9b81d5452e839E3617c914";
const SAFE_IMPL        = "0x8ed6751d931427Ebfe91720C0eE0bFf13005CCE3";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // 1. Deploy TestnetVerifier
  console.log("\nDeploying TestnetVerifier...");
  const Verifier = await ethers.getContractFactory("TestnetVerifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddr = await verifier.getAddress();
  console.log("✓ TestnetVerifier:", verifierAddr);

  // Sanity check
  const ok = await verifier.isVerified(deployer.address);
  console.log("  isVerified(any):", ok);

  // 2. Reconfigure StartupRegistry
  console.log("\nReconfiguring StartupRegistry...");
  const registry = await ethers.getContractAt("StartupRegistry", STARTUP_REGISTRY);
  const tx = await registry.setProtocolConfig(SAFE_IMPL, MOCK_USDC, verifierAddr);
  await tx.wait();
  console.log("✓ Protocol config updated with TestnetVerifier");

  // 3. Create fresh SAFE rounds for deployer's startup(s) only
  const ids = await registry.getStartups(0n, 100n);
  const CAP      = ethers.parseUnits("1000000", 6);
  const DISCOUNT = 2000n;
  const MIN_INV  = ethers.parseUnits("100", 6);
  const MAX_INV  = ethers.parseUnits("25000", 6);
  const DURATION = BigInt(90 * 86400);

  console.log(`\nChecking ${ids.length} startup(s) for new rounds...`);
  for (const id of ids) {
    const s = await registry.getStartup(id);
    const isDeployer = s.founderAddress.toLowerCase() === deployer.address.toLowerCase();
    if (!isDeployer) {
      console.log(`  ${s.companyName}: skipped (founder must use UI)`);
      continue;
    }
    const tx2 = await registry.createRound(id, CAP, DISCOUNT, MIN_INV, MAX_INV, DURATION);
    await tx2.wait();
    const safes = await registry.getSAFEContracts(id);
    console.log(`  ✓ ${s.companyName} new SAFE: ${safes[safes.length - 1]}`);
  }

  console.log("\n=================================================");
  console.log("New TestnetVerifier:", verifierAddr);
  console.log("\nUpdate frontend/src/lib/contracts.ts:");
  console.log(`  investorRegistry: '${verifierAddr}',`);
  console.log("\nFor Demo Company 1: founder must connect wallet & create round in UI.");
  console.log("Investors can now invest without KYC checks on testnet.");
}

main().catch(e => { console.error(e.message); process.exitCode = 1; });
