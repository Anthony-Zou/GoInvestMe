import hre from "hardhat";
const { upgrades } = hre;

async function main() {
    const safeProxy = "0xeF1B898b0871228AA3b0F78A45d61f7517ac20E2";

    console.log("Fetching implementation addresses...");
    const safeImpl = await upgrades.erc1967.getImplementationAddress(safeProxy);

    console.log("TokenizedSAFE Implementation:", safeImpl);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
