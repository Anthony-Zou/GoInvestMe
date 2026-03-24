/**
 * configure_sepolia.js
 * Deploys TokenizedSAFE implementation + MockUSDC, then calls
 * StartupRegistry.setProtocolConfig() on the already-deployed registry.
 *
 * Run: npm run configure:sepolia
 */
import hre from "hardhat";
const { ethers } = hre;

const STARTUP_REGISTRY  = "0xE4a56B8F0EEabDf2b10da8f04bBeE249bC1411b9";
const INVESTOR_REGISTRY = "0x54Ee6D45Ca93Cb58A6eBd07f8D87be6D9C9F6c12";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Configuring with account:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    const registry = await ethers.getContractAt("StartupRegistry", STARTUP_REGISTRY);

    // Check current state
    const currentImpl = await registry.safeImplementation().catch(() => null);
    const currentUSDC = await registry.usdcToken().catch(() => null);
    console.log("Current safeImplementation:", currentImpl);
    console.log("Current usdcToken:", currentUSDC);

    // 1. Deploy MockUSDC (only if not already configured)
    let usdcAddress = currentUSDC !== ethers.ZeroAddress ? currentUSDC : null;
    if (!usdcAddress || usdcAddress === ethers.ZeroAddress) {
        console.log("\nDeploying MockUSDC...");
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        const usdc = await MockERC20.deploy("USD Coin", "USDC");
        await usdc.waitForDeployment();
        usdcAddress = await usdc.getAddress();
        console.log("MockUSDC deployed to:", usdcAddress);

        // Mint some USDC to deployer for testing
        const mintAmount = ethers.parseUnits("1000000", 6); // 1M USDC
        await usdc.mint(deployer.address, mintAmount);
        console.log("Minted 1,000,000 USDC to deployer");
    } else {
        console.log("Using existing USDC:", usdcAddress);
    }

    // 2. Deploy bare TokenizedSAFE implementation
    console.log("\nDeploying TokenizedSAFE implementation...");
    const TokenizedSAFE = await ethers.getContractFactory("TokenizedSAFE");
    const safeImpl = await TokenizedSAFE.deploy();
    await safeImpl.waitForDeployment();
    const safeImplAddress = await safeImpl.getAddress();
    console.log("TokenizedSAFE implementation:", safeImplAddress);

    // 3. Configure StartupRegistry
    console.log("\nCalling setProtocolConfig on StartupRegistry...");
    const tx = await registry.setProtocolConfig(safeImplAddress, usdcAddress, INVESTOR_REGISTRY);
    await tx.wait();
    console.log("✓ Protocol configured!");

    console.log("\n====================================================");
    console.log("CONFIGURATION COMPLETE");
    console.log("====================================================");
    console.log(`StartupRegistry:       ${STARTUP_REGISTRY}`);
    console.log(`InvestorRegistry:      ${INVESTOR_REGISTRY}`);
    console.log(`TokenizedSAFE Impl:    ${safeImplAddress}`);
    console.log(`MockUSDC:              ${usdcAddress}`);
    console.log("====================================================");
    console.log("\nAdd to frontend/.env.local:");
    console.log(`NEXT_PUBLIC_MOCK_USDC_ADDRESS=${usdcAddress}`);
    console.log("\nTo get test USDC in MetaMask, import the token above.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
