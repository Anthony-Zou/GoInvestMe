import hre from "hardhat";
const { ethers, upgrades } = hre;

async function main() {
    console.log("Deploying InvestorRegistry to local network...");

    const InvestorRegistry = await ethers.getContractFactory("InvestorRegistry");
    const investorRegistry = await upgrades.deployProxy(InvestorRegistry, [], {
        initializer: "initialize",
        kind: "uups",
    });

    await investorRegistry.waitForDeployment();
    const investorRegistryAddress = await investorRegistry.getAddress();

    console.log("InvestorRegistry deployed to:", investorRegistryAddress);

    console.log("Deploying StartupRegistry to local network...");

    const StartupRegistry = await ethers.getContractFactory("StartupRegistry");
    const startupRegistry = await upgrades.deployProxy(StartupRegistry, [], {
        initializer: "initialize",
        kind: "uups",
    });

    await startupRegistry.waitForDeployment();
    const startupRegistryAddress = await startupRegistry.getAddress();

    console.log("StartupRegistry deployed to:", startupRegistryAddress);

    // ... Registries deployed above ...

    console.log("Deploying TokenizedSAFE Implementation...");
    const TokenizedSAFE = await ethers.getContractFactory("TokenizedSAFE");
    const safeImpl = await TokenizedSAFE.deploy();
    await safeImpl.waitForDeployment();
    const safeImplAddress = await safeImpl.getAddress();
    console.log("TokenizedSAFE Implementation:", safeImplAddress);

    // Deploy Mock USDC (For Testnet/Local)
    // In production mainnet, replace this with actual USDC address
    console.log("Deploying Mock USDC...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("USD Coin", "USDC");
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();
    console.log("Mock USDC:", usdcAddress);

    // Configure StartupRegistry
    console.log("Configuring Protocol...");
    await startupRegistry.setProtocolConfig(
        safeImplAddress,
        usdcAddress,
        investorRegistryAddress
    );
    console.log("Protocol Configured.");

    console.log("Deployment complete!");
    console.log("----------------------------------------------------");
    console.log(`InvestorRegistry: ${investorRegistryAddress}`);
    console.log(`StartupRegistry:  ${startupRegistryAddress}`);
    console.log(`TokenizedSAFE Impl: ${safeImplAddress}`);
    console.log(`USDC (Mock):      ${usdcAddress}`);
    console.log("----------------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
