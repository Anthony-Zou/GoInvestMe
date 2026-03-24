/**
 * kyc_approve_investors.js
 * Reads all registered investors and sets KYC = true for unverified ones.
 * Deployer must have KYC_ROLE on InvestorRegistry.
 *
 * Run: npx hardhat run scripts/kyc_approve_investors.js --network sepolia
 */
import hre from "hardhat";
const { ethers } = hre;

const INVESTOR_REGISTRY = "0x54Ee6D45Ca93Cb58A6eBd07f8D87be6D9C9F6c12";
const ONE_YEAR = BigInt(365 * 24 * 60 * 60);

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Account:", deployer.address);

  const registry = await ethers.getContractAt("InvestorRegistry", INVESTOR_REGISTRY);

  // Check deployer has KYC_ROLE
  const KYC_ROLE = await registry.KYC_ROLE();
  const hasRole = await registry.hasRole(KYC_ROLE, deployer.address);
  if (!hasRole) {
    console.error("✗ Deployer does not have KYC_ROLE on InvestorRegistry!");
    console.error("  You need to grant it first.");
    process.exitCode = 1;
    return;
  }
  console.log("✓ Deployer has KYC_ROLE\n");

  // Fetch all investors (up to 100)
  const investors = await registry.getInvestors(0n, 100n);
  console.log(`Found ${investors.length} registered investor(s)\n`);

  if (investors.length === 0) {
    console.log("No investors registered yet.");
    return;
  }

  // getInvestors returns address[] directly
  for (const addr of investors) {
    const isVerified = await registry.isVerified(addr);

    if (isVerified) {
      console.log(`✓ Already verified: ${addr}`);
      continue;
    }

    console.log(`  Approving KYC for: ${addr} ...`);
    const tx = await registry.setKYCStatus(addr, true, ONE_YEAR);
    await tx.wait();
    console.log(`✓ KYC approved for ${addr}`);
  }

  console.log("\nDone.");
}

main().catch(e => { console.error(e.message); process.exitCode = 1; });
