import hre from "hardhat";
const { ethers } = hre;
const INVESTOR_REGISTRY = "0x54Ee6D45Ca93Cb58A6eBd07f8D87be6D9C9F6c12";
const ONE_YEAR = BigInt(365 * 24 * 60 * 60);

const INVESTORS = [
  "0x6a825EE91697939Ff375A33026564CD5387945a8",
  "0x6A4D13Ef0a75AAD68bc6fc58986b7D86c116481C",
];

async function main() {
  const [deployer] = await ethers.getSigners();
  const registry = await ethers.getContractAt("InvestorRegistry", INVESTOR_REGISTRY);

  for (const addr of INVESTORS) {
    console.log(`\nChecking ${addr}`);
    try {
      const reg = await registry.isInvestorRegistered(addr);
      console.log("  isRegistered:", reg);
    } catch(e) { console.log("  isInvestorRegistered error:", e.shortMessage); }

    try {
      const ver = await registry.isVerified(addr);
      console.log("  isVerified:", ver);
      if (!ver) {
        const tx = await registry.setKYCStatus(addr, true, ONE_YEAR);
        await tx.wait();
        console.log("  ✓ KYC set");
      }
    } catch(e) {
      console.log("  isVerified/setKYCStatus error:", e.shortMessage ?? e.message?.slice(0,150));
      // Try with static call to get revert reason
      try {
        await registry.isVerified.staticCall(addr);
      } catch(e2) {
        console.log("  staticCall error:", e2.reason ?? e2.shortMessage ?? e2.message?.slice(0,150));
      }
    }
  }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
