import hre from "hardhat";
const { ethers, upgrades } = hre;

const PROXY = "0x54Ee6D45Ca93Cb58A6eBd07f8D87be6D9C9F6c12";

async function main() {
  console.log("Upgrading InvestorRegistry...");
  const InvestorRegistry = await ethers.getContractFactory("InvestorRegistry");
  const upgraded = await upgrades.upgradeProxy(PROXY, InvestorRegistry);
  await upgraded.waitForDeployment();

  const impl = await upgrades.erc1967.getImplementationAddress(PROXY);
  console.log("✓ InvestorRegistry upgraded");
  console.log("  New implementation:", impl);
}

main().catch(e => { console.error(e); process.exitCode = 1; });
