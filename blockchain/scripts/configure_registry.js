import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const REGISTRY_PROXY = "0xE4a56B8F0EEabDf2b10da8f04bBeE249bC1411b9";

    // Config from verified deployments
    const SAFE_IMPL = "0xF8f07287A39Edc8420fe4fBC228fc1cF04c841aB";
    const INVESTOR_REGISTRY = "0x54Ee6D45Ca93Cb58A6eBd07f8D87be6D9C9F6c12"; // Proxy address
    const MOCK_USDC = "0xb24a0E87A06f6Aa72A9b81d5452e839E3617c914";

    console.log("Configuring StartupRegistry protocol addresses...");

    const StartupRegistry = await ethers.getContractFactory("StartupRegistry");
    const registry = StartupRegistry.attach(REGISTRY_PROXY);

    const tx = await registry.setProtocolConfig(SAFE_IMPL, MOCK_USDC, INVESTOR_REGISTRY);
    await tx.wait();

    console.log("Protocol configuration set!");
    console.log("SAFE Impl:", SAFE_IMPL);
    console.log("USDC:", MOCK_USDC);
    console.log("Investor Registry:", INVESTOR_REGISTRY);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
