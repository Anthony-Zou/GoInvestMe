import hre from "hardhat";
const { ethers } = hre;

const STARTUP_REGISTRY = "0xE4a56B8F0EEabDf2b10da8f04bBeE249bC1411b9";

async function main() {
  const registry = await ethers.getContractAt("StartupRegistry", STARTUP_REGISTRY);

  console.log("=== Protocol Config ===");
  const safeImpl = await registry.safeImplementation().catch(() => "ERROR");
  const usdcToken = await registry.usdcToken().catch(() => "ERROR");
  const invReg   = await registry.investorRegistry().catch(() => "ERROR");
  console.log("safeImplementation:", safeImpl);
  console.log("usdcToken:         ", usdcToken);
  console.log("investorRegistry:  ", invReg);

  console.log("\n=== All Startups ===");
  const ids = await registry.getStartups(0n, 100n);
  console.log("Total startups:", ids.length);

  for (const id of ids) {
    const s = await registry.getStartup(id);
    const safes = await registry.getSAFEContracts(id);
    console.log(`\n  ${s.companyName} (${id})`);
    console.log(`    founder:     ${s.founderAddress}`);
    console.log(`    isActive:    ${s.isActive}`);
    console.log(`    kybVerified: ${s.kybVerified}`);
    console.log(`    SAFEs:       ${safes.length > 0 ? safes.join(', ') : 'none'}`);
  }
}

main().catch(e => { console.error(e); process.exitCode = 1; });
