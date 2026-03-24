/**
 * raw_revert.js — Get exact revert selector using low-level eth_call
 */
import hre from "hardhat";
const { ethers } = hre;

const STARTUP_REGISTRY = "0xE4a56B8F0EEabDf2b10da8f04bBeE249bC1411b9";
const PINGAN_ID        = "0xfFB8B4E025AB74e27f90a29CE866f2Ae6B9C6a62";

async function main() {
  const [deployer] = await ethers.getSigners();
  const provider = ethers.provider;

  const registry = await ethers.getContractAt("StartupRegistry", STARTUP_REGISTRY);

  const cap       = ethers.parseUnits("1000000", 6);
  const discount  = 2000n;
  const minInvest = ethers.parseUnits("100", 6);
  const maxInvest = ethers.parseUnits("25000", 6);
  const duration  = BigInt(90 * 86400);

  // Encode the createRound call
  const calldata = registry.interface.encodeFunctionData("createRound", [
    PINGAN_ID, cap, discount, minInvest, maxInvest, duration
  ]);

  console.log("Calling with deployer:", deployer.address);

  // Use raw JSON-RPC call to get exact error data
  try {
    const result = await provider.send("eth_call", [{
      from: deployer.address,
      to: STARTUP_REGISTRY,
      data: calldata,
      gas: "0x4C4B40", // 5M gas
    }, "latest"]);
    console.log("SUCCEEDED:", result);
  } catch (e) {
    // Walk the full error chain for revert data
    const raw = JSON.stringify(e, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2);
    console.log("Full error JSON:", raw.slice(0, 2000));

    // Also try parent chain
    let cur = e;
    let depth = 0;
    while (cur && depth < 5) {
      const d = cur.data ?? cur.error?.data ?? cur.parent?.data;
      if (d && d !== '0x' && d !== 'undefined') {
        console.log(`Found data at depth ${depth}:`, d);
        const known = {
          '0xf92ee8a9': 'InvalidInitialization()',
          '0xd7e6bcf8': 'NotInitializing()',
          '0x9996b315': 'ERC1167FailedCreateClone()',
          '0xe07c8dba': 'UUPSUnauthorizedCallContext()',
          '0x08c379a0': 'Error(string)',
        };
        const sel = String(d).slice(0, 10);
        console.log("Selector:", sel, "→", known[sel] ?? 'unknown');
        if (sel === '0x08c379a0') {
          const msg = ethers.AbiCoder.defaultAbiCoder().decode(['string'], '0x' + String(d).slice(10));
          console.log("Error string:", msg[0]);
        }
      }
      cur = cur.parent ?? cur.cause;
      depth++;
    }
  }
}

main().catch(e => { console.error(e.message); process.exitCode = 1; });
