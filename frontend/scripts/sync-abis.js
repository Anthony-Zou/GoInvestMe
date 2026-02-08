const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.resolve(__dirname, '../../blockchain/artifacts/contracts');
const DEST_DIR = path.resolve(__dirname, '../src/lib/abis');

const CONTRACTS = [
    { name: 'TokenizedSAFE', path: 'TokenizedSAFE.sol/TokenizedSAFE.json' },
    { name: 'StartupRegistry', path: 'StartupRegistry.sol/StartupRegistry.json' },
    { name: 'InvestorRegistry', path: 'InvestorRegistry.sol/InvestorRegistry.json' },
    { name: 'MockERC20', path: '../test/MockERC20.sol/MockERC20.json' } // Optional, likely in test artifacts
];

function syncAbis() {
    if (!fs.existsSync(DEST_DIR)) {
        fs.mkdirSync(DEST_DIR, { recursive: true });
    }

    CONTRACTS.forEach(contract => {
        // Try finding it (Mock might be in test folder? actually mocks are in contracts/test usually, or just test)
        // Hardhat keeps mocks in artifacts/contracts/test/MockERC20.sol usually if source is contracts/test
        // My MockERC20 is likely in 'contracts' or 'test'. 
        // Based on previous ls, I saw 'contracts/isDir'. I'll search for it if needed.
        // For now, focus on the Core 3.

        const srcPath = path.join(ARTIFACTS_DIR, contract.path);
        const destPath = path.join(DEST_DIR, `${contract.name}.json`);

        try {
            if (fs.existsSync(srcPath)) {
                const content = fs.readFileSync(srcPath, 'utf8');
                const json = JSON.parse(content);
                // We only need abi
                const minimal = { abi: json.abi };
                fs.writeFileSync(destPath, JSON.stringify(minimal, null, 2));
                console.log(`Synced ${contract.name}`);
            } else {
                console.warn(`Source not found for ${contract.name}: ${srcPath}`);
            }
        } catch (e) {
            console.error(`Error syncing ${contract.name}:`, e.message);
        }
    });
}

syncAbis();
