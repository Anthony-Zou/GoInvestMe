import hre from "hardhat";
const { ethers, network } = hre;
const INV_REG = "0x54Ee6D45Ca93Cb58A6eBd07f8D87be6D9C9F6c12";
const INVESTOR = "0x6a825EE91697939Ff375A33026564CD5387945a8";
const ONE_YEAR = BigInt(365 * 24 * 60 * 60);

async function main() {
  await network.provider.request({ method: "hardhat_reset", params: [{ forking: { jsonRpcUrl: process.env.SEPOLIA_RPC_URL } }] });
  const [owner] = await ethers.getSigners();

  // Give owner money
  await network.provider.send("hardhat_setBalance", [owner.address, "0x56BC75E2D63100000"]);

  const reg = await ethers.getContractAt("InvestorRegistry", INV_REG, owner);

  console.log("totalInvestors:", (await reg.totalInvestors()).toString());

  // Try isVerified
  try {
    const v = await reg.isVerified(INVESTOR);
    console.log("isVerified:", v);
  } catch(e) {
    console.log("isVerified FAILED:", e.reason ?? e.shortMessage ?? e.message?.slice(0,200));
  }

  // Try setKYCStatus directly 
  try {
    const tx = await reg.setKYCStatus(INVESTOR, true, ONE_YEAR);
    await tx.wait();
    console.log("setKYCStatus SUCCESS");
  } catch(e) {
    console.log("setKYCStatus FAILED:", e.reason ?? e.shortMessage ?? e.message?.slice(0,200));
  }

  // Check KYC_ROLE
  const KYC_ROLE = await reg.KYC_ROLE();
  const hasRole = await reg.hasRole(KYC_ROLE, owner.address);
  console.log("owner has KYC_ROLE:", hasRole);

  // Try granting role
  if (!hasRole) {
    const ADMIN_ROLE = await reg.DEFAULT_ADMIN_ROLE();
    const hasAdmin = await reg.hasRole(ADMIN_ROLE, owner.address);
    console.log("owner has ADMIN_ROLE:", hasAdmin);
  }
}
main().catch(e => { console.error(e.message?.slice(0,300)); process.exitCode = 1; });
