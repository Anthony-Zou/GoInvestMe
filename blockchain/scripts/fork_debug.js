/**
 * fork_debug.js
 * Run against local hardhat network that forks Sepolia.
 * Usage: npx hardhat run scripts/fork_debug.js (no --network flag, runs on hardhat network)
 *
 * First set in hardhat.config.js: hardhat.forking = { url: SEPOLIA_RPC_URL }
 * OR run manually with: HARDHAT_FORK=1 npx hardhat run scripts/fork_debug.js
 */
import hre from "hardhat";
const { ethers, network } = hre;

const STARTUP_REGISTRY = "0xE4a56B8F0EEabDf2b10da8f04bBeE249bC1411b9";
const SAFE_IMPL        = "0x2993915D7D077FA11b632465C2D4a2756E3fb4F8";
const PINGAN_FOUNDER   = "0x6A4D13Ef0a75AAD68bc6fc58986b7D86c116481C";
const PINGAN_ID        = "0xfFB8B4E025AB74e27f90a29CE866f2Ae6B9C6a62";
const USDC             = "0xb24a0E87A06f6Aa72A9b81d5452e839E3617c914";
const INV_REG          = "0x54Ee6D45Ca93Cb58A6eBd07f8D87be6D9C9F6c12";

async function main() {
  // Fork Sepolia at current block
  console.log("Forking Sepolia...");
  await network.provider.request({
    method: "hardhat_reset",
    params: [{
      forking: {
        jsonRpcUrl: process.env.SEPOLIA_RPC_URL,
      }
    }]
  });

  // Impersonate founder
  await network.provider.request({ method: "hardhat_impersonateAccount", params: [PINGAN_FOUNDER] });
  await network.provider.send("hardhat_setBalance", [PINGAN_FOUNDER, "0x56BC75E2D63100000"]); // 100 ETH

  const founder = await ethers.getSigner(PINGAN_FOUNDER);
  const registry = await ethers.getContractAt("StartupRegistry", STARTUP_REGISTRY, founder);

  const cap       = ethers.parseUnits("1000000", 6);
  const discount  = 2000n;
  const minInvest = ethers.parseUnits("100", 6);
  const maxInvest = ethers.parseUnits("25000", 6);
  const duration  = BigInt(90 * 86400);

  console.log("Calling createRound as founder:", PINGAN_FOUNDER);

  try {
    // Use callStatic to get better trace
    const safeAddr = await registry.createRound.staticCall(
      PINGAN_ID, cap, discount, minInvest, maxInvest, duration
    );
    console.log("✓ Simulation PASSED — SAFE would be at:", safeAddr);

    // Send real tx
    const tx = await registry.createRound(
      PINGAN_ID, cap, discount, minInvest, maxInvest, duration,
      { gasLimit: 3_000_000 }
    );
    const receipt = await tx.wait();
    console.log("✓ Transaction CONFIRMED, gas used:", receipt.gasUsed.toString());

    const safes = await registry.getSAFEContracts(PINGAN_ID);
    console.log("SAFE deployed at:", safes[safes.length - 1]);

    // Verify SAFE is usable
    const safe = await ethers.getContractAt("TokenizedSAFE", safes[0]);
    console.log("SAFE name:", await safe.name());
    console.log("SAFE valuationCap:", ethers.formatUnits(await safe.valuationCap(), 6));

  } catch (e) {
    console.error("✗ FAILED");
    console.error("reason:", e.reason ?? e.shortMessage ?? e.message?.slice(0, 200));
    if (e.revert) console.error("revert:", e.revert);
    // Get full stack trace from Hardhat
    if (e.transaction) {
      try {
        await network.provider.send("debug_traceTransaction", [e.transaction.hash, {}]);
      } catch {}
    }
  }
}

main().catch(e => { console.error(e.message?.slice(0, 300)); process.exitCode = 1; });
