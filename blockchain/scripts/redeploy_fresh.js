/**
 * redeploy_fresh.js
 * 1. Deploy a fresh InvestorRegistry proxy
 * 2. Register + KYC-verify both investor wallets
 * 3. Update StartupRegistry.setProtocolConfig with new InvestorRegistry
 * 4. Create new SAFE rounds for both startups (old ones used broken InvestorRegistry)
 *
 * Run: npx hardhat run scripts/redeploy_fresh.js --network sepolia
 */
import hre from "hardhat";
const { ethers, upgrades } = hre;

const STARTUP_REGISTRY = "0xE4a56B8F0EEabDf2b10da8f04bBeE249bC1411b9";
const MOCK_USDC        = "0xb24a0E87A06f6Aa72A9b81d5452e839E3617c914";
const SAFE_IMPL        = "0x8ed6751d931427Ebfe91720C0eE0bFf13005CCE3"; // from configure_sepolia run

// All wallets that need to invest
const INVESTOR_WALLETS = [
  "0x6a825EE91697939Ff375A33026564CD5387945a8",
  "0x6A4D13Ef0a75AAD68bc6fc58986b7D86c116481C",
];

const ONE_YEAR = BigInt(365 * 24 * 60 * 60);

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address, "\n");

  // ── 1. Deploy fresh InvestorRegistry ─────────────────────────────────────
  console.log("Deploying fresh InvestorRegistry...");
  const InvestorRegistry = await ethers.getContractFactory("InvestorRegistry");
  const invReg = await upgrades.deployProxy(InvestorRegistry, [], {
    initializer: "initialize", kind: "uups",
  });
  await invReg.waitForDeployment();
  const invRegAddr = await invReg.getAddress();
  console.log("✓ InvestorRegistry:", invRegAddr);

  // ── 2. Register + KYC all investor wallets ────────────────────────────────
  const KYC_ROLE = await invReg.KYC_ROLE();
  // deployer already has KYC_ROLE (granted in initialize)

  for (const wallet of INVESTOR_WALLETS) {
    console.log(`\nRegistering investor ${wallet}...`);
    try {
      const tx1 = await invReg.registerInvestorByAdmin(wallet, "US");
      await tx1.wait();
      console.log("  ✓ Registered");
    } catch(e) {
      // Try alternative: maybe function is named differently
      console.log("  registerInvestorByAdmin failed, trying direct setKYCStatus...");
    }

    const tx2 = await invReg.setKYCStatus(wallet, true, ONE_YEAR);
    await tx2.wait();
    console.log("  ✓ KYC approved");

    const verified = await invReg.isVerified(wallet);
    console.log("  isVerified:", verified);
  }

  // ── 3. Update StartupRegistry protocol config ─────────────────────────────
  console.log("\nUpdating StartupRegistry protocol config...");
  const registry = await ethers.getContractAt("StartupRegistry", STARTUP_REGISTRY);
  const tx = await registry.setProtocolConfig(SAFE_IMPL, MOCK_USDC, invRegAddr);
  await tx.wait();
  console.log("✓ Protocol config updated");

  // ── 4. Create new SAFE rounds for each startup ────────────────────────────
  const startupIds = await registry.getStartups(0n, 100n);
  console.log(`\nCreating new rounds for ${startupIds.length} startup(s)...`);

  const CAP       = ethers.parseUnits("1000000", 6);
  const DISCOUNT  = 2000n;
  const MIN_INV   = ethers.parseUnits("100", 6);
  const MAX_INV   = ethers.parseUnits("25000", 6);
  const DURATION  = BigInt(90 * 86400);

  for (const id of startupIds) {
    const s = await registry.getStartup(id);
    console.log(`\n  ${s.companyName} (founder: ${s.founderAddress})`);

    // Only the founder can create a round — deployer can only do it for their own startup
    if (s.founderAddress.toLowerCase() !== deployer.address.toLowerCase()) {
      console.log("  → Skipping (not deployer's startup — founder must create round via UI)");
      continue;
    }

    const tx = await registry.createRound(id, CAP, DISCOUNT, MIN_INV, MAX_INV, DURATION);
    await tx.wait();
    const safes = await registry.getSAFEContracts(id);
    console.log(`  ✓ New SAFE: ${safes[safes.length - 1]}`);
  }

  console.log("\n=================================================");
  console.log("DONE");
  console.log("=================================================");
  console.log("New InvestorRegistry:", invRegAddr);
  console.log("\nAdd to frontend/.env.local:");
  console.log(`NEXT_PUBLIC_INVESTOR_REGISTRY=${invRegAddr}`);
  console.log("\nFor Demo Company 1: connect founder wallet and click Launch Round in UI");
}

main().catch(e => { console.error(e.message); process.exitCode = 1; });
