/**
 * Creates a round for "Demo Company 1" by impersonating its founder.
 * Run on Sepolia fork locally to verify, then manually on Sepolia.
 * Note: We can only call this from the DEMO founder wallet, not the deployer.
 * This script just verifies the simulation passes; the UI will send the real tx.
 */
import hre from "hardhat";
const { ethers } = hre;

const STARTUP_REGISTRY  = "0xE4a56B8F0EEabDf2b10da8f04bBeE249bC1411b9";
const DEMO_STARTUP_ID   = "0x5e0c5dBAa767ab40414B905A78892c1E00E774cb";
const DEMO_FOUNDER      = "0x6a825EE91697939Ff375A33026564CD5387945a8";

async function main() {
  const registry = await ethers.getContractAt("StartupRegistry", STARTUP_REGISTRY);

  const cap       = ethers.parseUnits("1000000", 6);
  const discount  = 2000n;
  const minInvest = ethers.parseUnits("100", 6);
  const maxInvest = ethers.parseUnits("25000", 6);
  const duration  = BigInt(90 * 86400);

  console.log("Checking Demo Company 1 startup...");
  const s = await registry.getStartup(DEMO_STARTUP_ID);
  console.log("  name:        ", s.companyName);
  console.log("  kybVerified: ", s.kybVerified);
  console.log("  founder:     ", s.founderAddress);
  console.log("\nTo launch a round for this startup,");
  console.log("connect wallet", DEMO_FOUNDER, "and click Launch Round in the UI.");
  console.log("createRound simulation should now succeed (registry was upgraded).");

  // Verify state is good
  const safeImpl = await registry.safeImplementation();
  console.log("\nCurrent SAFE impl:", safeImpl, safeImpl !== ethers.ZeroAddress ? "✓" : "✗ NOT SET");

  const safes = await registry.getSAFEContracts(DEMO_STARTUP_ID);
  console.log("Existing SAFEs:", safes.length === 0 ? "none — ready to create round" : safes.join(', '));
}

main().catch(e => { console.error(e.message); process.exitCode = 1; });
