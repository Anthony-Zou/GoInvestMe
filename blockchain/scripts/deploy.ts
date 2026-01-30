import { network } from "hardhat";
import GoInvestMeCoreModule from "../ignition/modules/GoInvestMeCore.js";

/**
 * Deployment script for GoInvestMeCore contract
 * 
 * Usage:
 *   npx hardhat ignition deploy ignition/modules/GoInvestMeCore.ts --network sepolia
 */

async function main() {
  console.log("🚀 Starting GoInvestMeCore deployment...\n");
  
  // Display deployer info
  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  
  console.log(`👤 Deployer address: ${deployer.account.address}`);
  
  const balance = await publicClient.getBalance({ 
    address: deployer.account.address 
  });
  console.log(`💰 Deployer balance: ${(Number(balance) / 1e18).toFixed(4)} ETH\n`);
  
  if (balance === 0n) {
    console.error("❌ Error: Deployer has no ETH!");
    console.error("   Get testnet ETH from: https://sepoliafaucet.com/");
    process.exit(1);
  }
  
  console.log("📝 Deploying contract...");
  console.log("   This may take 30-60 seconds on testnet...\n");
  
  const startTime = Date.now();
  
  // Deploy the contract directly
  const contract = await viem.deployContract("GoInvestMeCore");
  
  const deployTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log("✅ Contract deployed successfully!\n");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`📍 Contract Address: ${contract.address}`);
  console.log(`👤 Contract Owner:   ${deployer.account.address}`);
  console.log(`⏱️  Deploy Time:     ${deployTime}s`);
  console.log("═══════════════════════════════════════════════════════════\n");
  
  // Get contract info
  const version = await contract.read.version();
  const owner = await contract.read.owner();
  
  console.log("📊 Contract Information:");
  console.log(`   Version: ${version}`);
  console.log(`   Owner: ${owner}`);
  console.log(`   Min Supply: 100 coins`);
  console.log(`   Max Supply: 10,000,000 coins`);
  console.log(`   Min Price: 0.0001 ETH`);
  console.log(`   Max Price: 100 ETH\n`);
  
  console.log("🔍 View on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${contract.address}\n`);
  
  console.log("📝 Next Steps:");
  console.log("   1. Verify contract source code:");
  console.log(`      npx hardhat verify --network sepolia ${contract.address}`);
  console.log("   2. Test contract via Etherscan UI");
  console.log("   3. Share contract address with your team\n");
  
  console.log("✨ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
