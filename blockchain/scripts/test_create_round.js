/**
 * test_create_round.js
 * Simulates createRound from the deployer for PingAnComputing to find the exact revert.
 */
import hre from "hardhat";
const { ethers } = hre;

const STARTUP_REGISTRY = "0xE4a56B8F0EEabDf2b10da8f04bBeE249bC1411b9";
const PINGAN_STARTUP_ID = "0xfFB8B4E025AB74e27f90a29CE866f2Ae6B9C6a62";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Calling as:", deployer.address);

  const registry = await ethers.getContractAt("StartupRegistry", STARTUP_REGISTRY);

  // Use same values as the UI defaults
  const cap       = ethers.parseUnits("1000000", 6);  // $1M
  const discount  = 2000n;                             // 20%
  const minInvest = ethers.parseUnits("100", 6);
  const maxInvest = ethers.parseUnits("25000", 6);
  const duration  = BigInt(90 * 86400);               // 90 days

  console.log("\nArgs:");
  console.log("  startupId:", PINGAN_STARTUP_ID);
  console.log("  cap:      ", cap.toString());
  console.log("  discount: ", discount.toString());
  console.log("  minInvest:", minInvest.toString());
  console.log("  maxInvest:", maxInvest.toString());
  console.log("  duration: ", duration.toString());

  // First simulate with eth_call to get exact revert reason
  console.log("\nSimulating with eth_call...");
  try {
    const result = await registry.createRound.staticCall(
      PINGAN_STARTUP_ID, cap, discount, minInvest, maxInvest, duration
    );
    console.log("Simulation SUCCESS — would deploy SAFE at:", result);

    // Actually send it
    console.log("\nSending real transaction...");
    const tx = await registry.createRound(
      PINGAN_STARTUP_ID, cap, discount, minInvest, maxInvest, duration
    );
    console.log("Tx hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✓ Round created! Gas used:", receipt.gasUsed.toString());

    const safes = await registry.getSAFEContracts(PINGAN_STARTUP_ID);
    console.log("SAFE deployed at:", safes[safes.length - 1]);
  } catch (err) {
    console.error("\n✗ FAILED:", err.shortMessage ?? err.message);
    if (err.data) console.error("  Revert data:", err.data);
  }
}

main().catch(e => { console.error(e); process.exitCode = 1; });
