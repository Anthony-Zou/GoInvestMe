import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("Deploying InvestorRegistry to Sepolia...");

  const InvestorRegistry = await ethers.getContractFactory("InvestorRegistry");
  const investorRegistry = await upgrades.deployProxy(InvestorRegistry, [], {
    initializer: "initialize",
    kind: "uups",
  });

  await investorRegistry.waitForDeployment();
  const investorRegistryAddress = await investorRegistry.getAddress();

  console.log("InvestorRegistry deployed to:", investorRegistryAddress);

  console.log("Deploying StartupRegistry to Sepolia...");

  const StartupRegistry = await ethers.getContractFactory("StartupRegistry");
  const startupRegistry = await upgrades.deployProxy(StartupRegistry, [], {
    initializer: "initialize",
    kind: "uups",
  });

  await startupRegistry.waitForDeployment();
  const startupRegistryAddress = await startupRegistry.getAddress();

  console.log("StartupRegistry deployed to:", startupRegistryAddress);

  console.log("Deployment complete!");
  console.log("----------------------------------------------------");
  console.log(`InvestorRegistry: ${investorRegistryAddress}`);
  console.log(`StartupRegistry:  ${startupRegistryAddress}`);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
