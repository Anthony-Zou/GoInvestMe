import hre from "hardhat";
const { upgrades } = hre;

async function main() {
    const investorProxy = "0x54Ee6D45Ca93Cb58A6eBd07f8D87be6D9C9F6c12";
    const startupProxy = "0xE4a56B8F0EEabDf2b10da8f04bBeE249bC1411b9";

    console.log("Fetching implementation addresses...");
    const investorImpl = await upgrades.erc1967.getImplementationAddress(investorProxy);
    const startupImpl = await upgrades.erc1967.getImplementationAddress(startupProxy);

    console.log("InvestorRegistry Implementation:", investorImpl);
    console.log("StartupRegistry Implementation:", startupImpl);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
