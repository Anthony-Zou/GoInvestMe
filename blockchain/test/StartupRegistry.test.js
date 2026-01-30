import { expect } from "chai";
import hre from "hardhat";
const { ethers, upgrades } = hre;

describe("StartupRegistry", function () {
    let StartupRegistry;
    let registry;
    let owner, admin, kybOperator, founder1, founder2, safeContract;

    beforeEach(async function () {
        [owner, admin, kybOperator, founder1, founder2, safeContract] = await ethers.getSigners();

        StartupRegistry = await ethers.getContractFactory("StartupRegistry");
        registry = await upgrades.deployProxy(StartupRegistry, [], {
            initializer: "initialize",
            kind: "uups",
        });
        await registry.waitForDeployment();

        // Grant roles
        const ADMIN_ROLE = await registry.ADMIN_ROLE();
        const KYB_ROLE = await registry.KYB_ROLE();
        await registry.grantRole(ADMIN_ROLE, admin.address);
        await registry.grantRole(KYB_ROLE, kybOperator.address);
    });

    describe("Startup Registration", function () {
        it("Should register a new startup", async function () {
            const tx = await registry.connect(founder1).registerStartup("TechCo", "ipfs://QmHash");

            await expect(tx)
                .to.emit(registry, "StartupRegistered");

            const startupId = await registry.getStartupByName("TechCo");
            expect(startupId).to.not.equal(ethers.ZeroAddress);

            const startup = await registry.getStartup(startupId);
            expect(startup.companyName).to.equal("TechCo");
            expect(startup.founderAddress).to.equal(founder1.address);
            expect(startup.dataRoomCID).to.equal("ipfs://QmHash");
            expect(startup.isActive).to.be.true;
        });

        it("Should reject empty company name", async function () {
            await expect(
                registry.connect(founder1).registerStartup("", "ipfs://QmHash")
            ).to.be.revertedWith("Company name required");
        });

        it("Should reject duplicate company name", async function () {
            await registry.connect(founder1).registerStartup("TechCo", "ipfs://QmHash");

            await expect(
                registry.connect(founder2).registerStartup("TechCo", "ipfs://OtherHash")
            ).to.be.revertedWith("Company name already exists");
        });

        it("Should allow same founder to register multiple startups", async function () {
            await registry.connect(founder1).registerStartup("Startup A", "ipfs://HashA");
            await registry.connect(founder1).registerStartup("Startup B", "ipfs://HashB");

            const startups = await registry.getStartupsByFounder(founder1.address);
            expect(startups.length).to.equal(2);
        });
    });

    describe("KYB Verification", function () {
        let startupId;

        beforeEach(async function () {
            await registry.connect(founder1).registerStartup("TechCo", "ipfs://QmHash");
            startupId = await registry.getStartupByName("TechCo");
        });

        it("Should set KYB status by KYB operator", async function () {
            await expect(
                registry.connect(kybOperator).setKYBStatus(startupId, true)
            ).to.emit(registry, "KYBStatusUpdated")
                .withArgs(startupId, true);

            expect(await registry.isKYBVerified(startupId)).to.be.true;
            expect(await registry.totalVerified()).to.equal(1);
        });

        it("Should reject KYB update by non-operator", async function () {
            await expect(
                registry.connect(founder1).setKYBStatus(startupId, true)
            ).to.be.reverted;
        });

        it("Should update verification timestamp", async function () {
            await registry.connect(kybOperator).setKYBStatus(startupId, true);
            const startup = await registry.getStartup(startupId);
            expect(startup.kybTimestamp).to.be.gt(0);
        });
    });

    describe("Data Room Management", function () {
        let startupId;

        beforeEach(async function () {
            await registry.connect(founder1).registerStartup("TechCo", "ipfs://QmHash");
            startupId = await registry.getStartupByName("TechCo");
        });

        it("Should allow founder to update data room", async function () {
            const newCID = "ipfs://NewHash";

            await expect(
                registry.connect(founder1).updateDataRoom(startupId, newCID)
            ).to.emit(registry, "DataRoomUpdated")
                .withArgs(startupId, newCID);

            const startup = await registry.getStartup(startupId);
            expect(startup.dataRoomCID).to.equal(newCID);
        });

        it("Should reject data room update by non-founder", async function () {
            await expect(
                registry.connect(founder2).updateDataRoom(startupId, "ipfs://Hack")
            ).to.be.revertedWith("Not founder");
        });

        it("Should reject empty CID", async function () {
            await expect(
                registry.connect(founder1).updateDataRoom(startupId, "")
            ).to.be.revertedWith("CID required");
        });
    });

    describe("SAFE Contracts Management", function () {
        let startupId;

        beforeEach(async function () {
            await registry.connect(founder1).registerStartup("TechCo", "ipfs://QmHash");
            startupId = await registry.getStartupByName("TechCo");
        });

        it("Should add SAFE contract by admin", async function () {
            await expect(
                registry.connect(admin).addSAFEContract(startupId, safeContract.address)
            ).to.emit(registry, "SAFEContractAdded")
                .withArgs(startupId, safeContract.address);

            const contracts = await registry.getSAFEContracts(startupId);
            expect(contracts.length).to.equal(1);
            expect(contracts[0]).to.equal(safeContract.address);
        });

        it("Should reject SAFE addition by non-admin", async function () {
            await expect(
                registry.connect(founder1).addSAFEContract(startupId, safeContract.address)
            ).to.be.reverted;
        });
    });

    describe("Activation & Querying", function () {
        let startupId;

        beforeEach(async function () {
            await registry.connect(founder1).registerStartup("TechCo", "ipfs://QmHash");
            startupId = await registry.getStartupByName("TechCo");
        });

        it("Should deactivate startup", async function () {
            await expect(
                registry.connect(admin).deactivateStartup(startupId)
            ).to.emit(registry, "StartupDeactivated")
                .withArgs(startupId);

            const startup = await registry.getStartup(startupId);
            expect(startup.isActive).to.be.false;
        });

        it("Should reactivate startup", async function () {
            await registry.connect(admin).deactivateStartup(startupId);

            await expect(
                registry.connect(admin).reactivateStartup(startupId)
            ).to.emit(registry, "StartupReactivated")
                .withArgs(startupId);

            const startup = await registry.getStartup(startupId);
            expect(startup.isActive).to.be.true;
        });

        it("Should get paginated startups", async function () {
            await registry.connect(founder2).registerStartup("Startup2", "ipfs://Hash2");

            const list = await registry.getStartups(0, 5);
            expect(list.length).to.equal(2);
        });
    });

    describe("Upgradeability", function () {
        it("Should upgrade contract", async function () {
            const StartupRegistryV2 = await ethers.getContractFactory("StartupRegistry");
            const upgraded = await upgrades.upgradeProxy(
                await registry.getAddress(),
                StartupRegistryV2
            );

            expect(await upgraded.getAddress()).to.equal(await registry.getAddress());
        });
    });
    describe("Factory Functionality", function () {
        let safeImplAddress;
        let usdcAddress;
        let investorRegistryAddress;
        let startupId;

        beforeEach(async function () {
            // Deploy dependencies
            const MockERC20 = await ethers.getContractFactory("MockERC20");
            const usdc = await MockERC20.deploy("USDC", "USDC");
            usdcAddress = await usdc.getAddress();

            const MockInvestorRegistry = await ethers.getContractFactory("MockInvestorRegistry");
            const invReg = await MockInvestorRegistry.deploy();
            investorRegistryAddress = await invReg.getAddress();

            const TokenizedSAFE = await ethers.getContractFactory("TokenizedSAFE");
            const safeImpl = await TokenizedSAFE.deploy(); // Deploy logic only
            safeImplAddress = await safeImpl.getAddress();

            // Register a verified startup
            const tx = await registry.connect(founder1).registerStartup("FactoryCo", "ipfs://test");
            const receipt = await tx.wait();
            startupId = await registry.getStartupByName("FactoryCo");

            // Verify KYB
            await registry.connect(kybOperator).setKYBStatus(startupId, true); // Changed to kybOperator

            // Configure Protocol
            await registry.connect(admin).setProtocolConfig(safeImplAddress, usdcAddress, investorRegistryAddress);
        });

        it("Should create a new funding round", async function () {
            const tx = await registry.connect(founder1).createRound(
                startupId,
                1000000,
                2000,
                1000,
                50000,
                86400
            );

            await expect(tx).to.emit(registry, "RoundCreated");

            const safeContracts = await registry.getSAFEContracts(startupId);
            expect(safeContracts.length).to.equal(1);
        });

        it("Should fail if startup is not verified", async function () {
            await registry.connect(kybOperator).setKYBStatus(startupId, false);

            await expect(registry.connect(founder1).createRound(
                startupId, 1000000, 2000, 1000, 50000, 86400
            )).to.be.revertedWith("KYB not verified");
        });
    });
});
