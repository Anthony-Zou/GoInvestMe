import hre from "hardhat";
const { ethers, upgrades } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Constants
    const INVESTOR_REGISTRY_ADDRESS = "0x54Ee6D45Ca93Cb58A6eBd07f8D87be6D9C9F6c12"; // Deployed in previous step

    // 1. Deploy MockUSDC
    console.log("Deploying MockUSDC...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("Mock USDC", "mUSDC");
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();
    console.log("MockUSDC deployed to:", usdcAddress);

    // 2. Deploy TokenizedSAFE
    console.log("Deploying TokenizedSAFE...");
    const TokenizedSAFE = await ethers.getContractFactory("TokenizedSAFE");

    // SAFE Parameters
    const NAME = "Sepolia Tech SAFE";
    const SYMBOL = "SAFE-SEP";
    const CAP = ethers.parseUnits("1000000", 6); // 1M USDC
    const DISCOUNT = 2000; // 20%
    const MIN_INVEST = ethers.parseUnits("100", 6); // 100 USDC
    const MAX_INVEST = ethers.parseUnits("50000", 6); // 50k USDC
    const DURATION = 60 * 60 * 24 * 30; // 30 days

    const safe = await upgrades.deployProxy(TokenizedSAFE, [
        NAME,
        SYMBOL,
        usdcAddress,
        INVESTOR_REGISTRY_ADDRESS,
        deployer.address, // Founder address (using deployer for simplicity)
        CAP,
        DISCOUNT,
        MIN_INVEST,
        MAX_INVEST,
        DURATION
    ], {
        initializer: "initialize",
        kind: "uups",
    });

    await safe.waitForDeployment();
    const safeAddress = await safe.getAddress();
    console.log("TokenizedSAFE deployed to:", safeAddress);

    console.log("----------------------------------------------------");
    console.log(`MockUSDC:       ${usdcAddress}`);
    console.log(`TokenizedSAFE:  ${safeAddress}`);
    console.log("----------------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
