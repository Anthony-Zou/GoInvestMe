import hre from "hardhat";
const { ethers } = hre;

const STARTUP_REGISTRY = "0xE4a56B8F0EEabDf2b10da8f04bBeE249bC1411b9";
const SAFE_IMPL = "0x2993915D7D077FA11b632465C2D4a2756E3fb4F8";
const PINGAN_ID = "0xfFB8B4E025AB74e27f90a29CE866f2Ae6B9C6a62";

async function main() {
  const [deployer] = await ethers.getSigners();
  const provider = ethers.provider;

  // Check safeImpl has code
  const implCode = await provider.getCode(SAFE_IMPL);
  console.log("safeImpl code size:", (implCode.length - 2) / 2, "bytes", implCode === '0x' ? '(EMPTY - PROBLEM!)' : '(OK)');

  // Check registry has code
  const regCode = await provider.getCode(STARTUP_REGISTRY);
  console.log("registry code size:", (regCode.length - 2) / 2, "bytes");

  // Try to call the TokenizedSAFE implementation directly to check it
  const safeImpl = await ethers.getContractAt("TokenizedSAFE", SAFE_IMPL);
  try {
    const name = await safeImpl.name();
    console.log("safeImpl.name():", name, "(should be empty string)");
  } catch(e) {
    console.log("safeImpl.name() error:", e.shortMessage);
  }

  // Try Clones.clone simulation via low-level
  const registry = await ethers.getContractAt("StartupRegistry", STARTUP_REGISTRY);
  
  // Check each require separately via staticCall on view functions
  console.log("\n--- Checking each require ---");
  console.log("isRegistered:", await registry.getStartup(PINGAN_ID).then(s => s.isActive));
  const startup = await registry.getStartup(PINGAN_ID);
  console.log("founderAddress:", startup.founderAddress);
  console.log("deployer:      ", deployer.address);
  console.log("founder match: ", startup.founderAddress.toLowerCase() === deployer.address.toLowerCase());
  console.log("isActive:      ", startup.isActive);
  console.log("kybVerified:   ", startup.kybVerified);
  const safeImplAddr = await registry.safeImplementation();
  console.log("safeImpl set:  ", safeImplAddr !== ethers.ZeroAddress);
  console.log("safeImpl addr: ", safeImplAddr);
  const protocolAdmin = await registry.protocolAdmin().catch(() => 'N/A');
  console.log("protocolAdmin: ", protocolAdmin);
}

main().catch(e => { console.error(e.message); process.exitCode = 1; });
