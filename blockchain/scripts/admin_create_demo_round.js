/**
 * Admin creates a new SAFE round for Demo Company 1.
 * createRound() requires msg.sender == founderAddress, so admin instead:
 *   1. Deploys a fresh EIP-1167 clone of the SAFE implementation
 *   2. Initializes it with TestnetVerifier
 *   3. Calls addSAFEContract() (requires ADMIN_ROLE) to register it
 *
 * Run: npx hardhat run scripts/admin_create_demo_round.js --network sepolia
 */
import hre from "hardhat";
const { ethers } = hre;

const STARTUP_REGISTRY = "0xE4a56B8F0EEabDf2b10da8f04bBeE249bC1411b9";
const DEMO_STARTUP_ID  = "0x5e0c5dBAa767ab40414B905A78892c1E00E774cb";
const DEMO_FOUNDER     = "0x6a825EE91697939Ff375A33026564CD5387945a8";
const MOCK_USDC        = "0xb24a0E87A06f6Aa72A9b81d5452e839E3617c914";
const TESTNET_VERIFIER = "0xf62012971644baBEE365fdFc09f03681fDa80378";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const registry = await ethers.getContractAt("StartupRegistry", STARTUP_REGISTRY);

  // Print current state
  const s = await registry.getStartup(DEMO_STARTUP_ID);
  console.log("\nDemo Company 1:", s.companyName);
  console.log("  kybVerified:", s.kybVerified);
  console.log("  founder:    ", s.founderAddress);

  if (!s.kybVerified) {
    console.log("  → KYB not verified, approving...");
    const tx = await registry.setKYBStatus(DEMO_STARTUP_ID, true);
    await tx.wait();
    console.log("  ✓ KYB approved");
  }

  const safeImpl = await registry.safeImplementation();
  console.log("\nSAFE implementation:", safeImpl);

  // Deploy EIP-1167 minimal proxy clone of safeImpl
  // Initcode: deploys runtime bytecode that delegates all calls to safeImpl
  const addrHex = safeImpl.slice(2).toLowerCase().padStart(40, '0');
  const initcode =
    "0x3d602d80600a3d3981f3363d3d373d3d3d363d73" +
    addrHex +
    "5af43d82803e903d91602b57fd5bf3";

  console.log("\nDeploying EIP-1167 clone...");
  const deployTx = await deployer.sendTransaction({ data: initcode });
  const deployReceipt = await deployTx.wait();
  const cloneAddr = deployReceipt.contractAddress;
  console.log("✓ Clone deployed at:", cloneAddr);

  // Initialize the SAFE
  const safe = await ethers.getContractAt("TokenizedSAFE", cloneAddr);

  const CAP      = ethers.parseUnits("1000000", 6);
  const DISCOUNT = 2000n;
  const MIN_INV  = ethers.parseUnits("100", 6);
  const MAX_INV  = ethers.parseUnits("25000", 6);
  const DURATION = BigInt(90 * 86400);

  console.log("\nInitializing SAFE with TestnetVerifier...");
  const initTx = await safe.initialize(
    "Demo Company 1 SAFE",
    "SAFE",
    MOCK_USDC,
    TESTNET_VERIFIER,
    DEMO_FOUNDER,    // founder gets ADMIN_ROLE (milestones, etc.)
    deployer.address, // protocolAdmin gets DEFAULT_ADMIN_ROLE + UPGRADER_ROLE
    CAP,
    DISCOUNT,
    MIN_INV,
    MAX_INV,
    DURATION,
    ethers.ZeroAddress, // no protocol fee treasury
    0n                  // 0% fee
  );
  await initTx.wait();
  console.log("✓ SAFE initialized");

  // Register in StartupRegistry (deployer has ADMIN_ROLE)
  console.log("\nAdding to StartupRegistry...");
  const addTx = await registry.addSAFEContract(DEMO_STARTUP_ID, cloneAddr);
  await addTx.wait();
  console.log("✓ Registered");

  const safes = await registry.getSAFEContracts(DEMO_STARTUP_ID);
  console.log("\n=================================================");
  console.log("New Demo Company 1 SAFE:", cloneAddr);
  console.log("All SAFEs:", safes);
  console.log("\nThe Deal Flow page will now show Demo Company 1 as Live.");
}

main().catch(e => { console.error(e); process.exitCode = 1; });
