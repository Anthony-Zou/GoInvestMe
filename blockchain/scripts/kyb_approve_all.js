/**
 * kyb_approve_all.js
 * Reads all registered startups and sets kybVerified = true for any unverified ones.
 * The deployer wallet must have KYB_ROLE on StartupRegistry.
 *
 * Run: npx hardhat run scripts/kyb_approve_all.js --network sepolia
 */
import hre from "hardhat";
const { ethers } = hre;

const STARTUP_REGISTRY = "0xE4a56B8F0EEabDf2b10da8f04bBeE249bC1411b9";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Account:", deployer.address);

  const registry = await ethers.getContractAt("StartupRegistry", STARTUP_REGISTRY);

  // Fetch all startup IDs (up to 100)
  const ids = await registry.getStartups(0n, 100n);
  console.log(`Found ${ids.length} startup(s)\n`);

  if (ids.length === 0) {
    console.log("No startups registered yet.");
    return;
  }

  for (const id of ids) {
    const startup = await registry.getStartup(id);
    const name = startup.companyName ?? startup[0];
    const isVerified = await registry.isKYBVerified(id);

    if (isVerified) {
      console.log(`✓ Already verified: ${name} (${id})`);
      continue;
    }

    console.log(`  Approving KYB for: ${name} (${id}) ...`);
    const tx = await registry.setKYBStatus(id, true);
    await tx.wait();
    console.log(`✓ KYB approved for ${name}`);
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
