import hre from "hardhat";
const { ethers } = hre;
const INVESTOR_REGISTRY = "0x54Ee6D45Ca93Cb58A6eBd07f8D87be6D9C9F6c12";
const ONE_YEAR = BigInt(365 * 24 * 60 * 60);

async function main() {
  const [deployer] = await ethers.getSigners();
  const registry = await ethers.getContractAt("InvestorRegistry", INVESTOR_REGISTRY);

  const total = await registry.totalInvestors();
  console.log("totalInvestors:", total.toString());

  const addrs = await registry.getInvestors(0n, total);
  console.log("addresses:", addrs);

  for (const addr of addrs) {
    const verified = await registry.isVerified(addr);
    const registered = await registry.isInvestorRegistered(addr);
    console.log(`\n${addr}`);
    console.log("  registered:", registered, "verified:", verified);
    if (!verified) {
      try {
        const tx = await registry.setKYCStatus(addr, true, ONE_YEAR);
        await tx.wait();
        console.log("  ✓ KYC approved");
      } catch(e) {
        console.log("  ✗ setKYCStatus failed:", e.shortMessage ?? e.message?.slice(0,100));
      }
    }
  }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
