import hre from "hardhat";
const { ethers, upgrades } = hre;

async function main() {
    const PROXY_ADDRESS = "0xE4a56B8F0EEabDf2b10da8f04bBeE249bC1411b9"; // Sepolia Proxy

    console.log("Upgrading StartupRegistry...");
    const StartupRegistry = await ethers.getContractFactory("StartupRegistry");
    const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, StartupRegistry);
    await upgraded.waitForDeployment();

    console.log("StartupRegistry upgraded");

    // Verify Implementation
    const implAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
    console.log("New Implementation:", implAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
