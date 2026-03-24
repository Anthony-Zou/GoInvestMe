/**
 * debug_round.js — Step-by-step isolation to find the exact revert in createRound
 */
import hre from "hardhat";
const { ethers } = hre;

const STARTUP_REGISTRY = "0xE4a56B8F0EEabDf2b10da8f04bBeE249bC1411b9";
const SAFE_IMPL        = "0x2993915D7D077FA11b632465C2D4a2756E3fb4F8";
const PINGAN_ID        = "0xfFB8B4E025AB74e27f90a29CE866f2Ae6B9C6a62";
const USDC             = "0xb24a0E87A06f6Aa72A9b81d5452e839E3617c914";
const INV_REGISTRY     = "0x54Ee6D45Ca93Cb58A6eBd07f8D87be6D9C9F6c12";

async function main() {
  const [deployer] = await ethers.getSigners();
  const provider = ethers.provider;

  // ── Test 1: Manually create a clone and call initialize ───────────────────
  console.log("=== Test 1: Manual clone + initialize ===");

  // Deploy a Clones library user contract inline
  // Instead, use CREATE2 to simulate what createRound does
  // We'll deploy a fresh TokenizedSAFE implementation and clone it locally

  // Deploy fresh implementation
  console.log("Deploying fresh TokenizedSAFE impl...");
  const TokenizedSAFE = await ethers.getContractFactory("TokenizedSAFE");
  const freshImpl = await TokenizedSAFE.deploy();
  await freshImpl.waitForDeployment();
  console.log("Fresh impl at:", await freshImpl.getAddress());

  // Deploy a test cloner contract to simulate createRound
  const clonerABI = [
    "function cloneAndInit(address impl, string name, string symbol, address usdc, address invReg, address founder, address admin, uint256 cap, uint256 disc, uint256 minInv, uint256 maxInv, uint256 dur, address treasury, uint256 fee) external returns (address)"
  ];

  // Manually clone via the registry's createRound
  // Test with the existing impl on Sepolia
  console.log("\n=== Test 2: Try createRound via staticCall with more gas ===");
  const registry = await ethers.getContractAt("StartupRegistry", STARTUP_REGISTRY);

  const cap       = ethers.parseUnits("1000000", 6);
  const discount  = 2000n;
  const minInvest = ethers.parseUnits("100", 6);
  const maxInvest = ethers.parseUnits("25000", 6);
  const duration  = BigInt(90 * 86400);

  // Try raw eth_call with explicit gas to see if it's a gas estimation issue
  try {
    const result = await registry.createRound.staticCall(
      PINGAN_ID, cap, discount, minInvest, maxInvest, duration,
      { gasLimit: 5_000_000 }
    );
    console.log("staticCall PASSED — SAFE would be at:", result);
  } catch (e) {
    console.log("staticCall FAILED:", e.shortMessage ?? e.message);

    // Try to decode revert data
    if (e.data && e.data !== '0x') {
      console.log("Raw revert data:", e.data);
      // Try to decode as Error(string)
      try {
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(['string'], '0x' + e.data.slice(10));
        console.log("Decoded revert:", decoded[0]);
      } catch {}
      // Try custom errors
      const errSigs = [
        'InvalidInitialization()', 'NotInitializing()', 'AccessControlUnauthorizedAccount(address,bytes32)',
        'ERC1967InvalidImplementation(address)', 'UUPSUnauthorizedCallContext()',
      ];
      for (const sig of errSigs) {
        const selector = ethers.id(sig).slice(0, 10);
        if (e.data.startsWith(selector)) {
          console.log("Custom error:", sig);
        }
      }
    }
  }

  // ── Test 3: Clone the LIVE impl and call initialize directly ─────────────
  console.log("\n=== Test 3: Clone live impl and call initialize directly ===");
  // Deploy a simple factory to do the clone
  const factoryBytecode = `
    pragma solidity ^0.8.20;
    import "@openzeppelin/contracts/proxy/Clones.sol";
    contract TestCloner {
        function doClone(address impl) external returns (address) {
            return Clones.clone(impl);
        }
    }
  `;

  // Use the already-compiled test cloner if available, else skip
  try {
    const TestCloner = await ethers.getContractFactory("TestCloner").catch(() => null);
    if (TestCloner) {
      const cloner = await TestCloner.deploy();
      await cloner.waitForDeployment();
      const cloneAddr = await cloner.doClone.staticCall(SAFE_IMPL);
      console.log("Clone address (staticCall):", cloneAddr);

      // Now try to call initialize on it
      const safeClone = await ethers.getContractAt("TokenizedSAFE", cloneAddr);
      const tx = await cloner.doClone(SAFE_IMPL); // Actually create it
      await tx.wait();

      console.log("Calling initialize on clone...");
      try {
        await safeClone.initialize.staticCall(
          "Test SAFE", "SAFE", USDC, INV_REGISTRY,
          deployer.address, deployer.address,
          cap, discount, minInvest, maxInvest, duration,
          ethers.ZeroAddress, 0n,
          { gasLimit: 3_000_000 }
        );
        console.log("initialize staticCall PASSED");
      } catch (e2) {
        console.log("initialize staticCall FAILED:", e2.shortMessage ?? e2.message);
        if (e2.data) console.log("Revert data:", e2.data);
      }
    } else {
      console.log("TestCloner not available, skipping");
    }
  } catch (e) {
    console.log("Test 3 skipped:", e.message.slice(0, 80));
  }
}

main().catch(e => { console.error(e.message); process.exitCode = 1; });
