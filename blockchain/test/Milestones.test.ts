
import { expect } from "chai";
import hre from "hardhat";
const { ethers, upgrades } = hre;
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("TokenizedSAFE Milestones", function () {
    async function deployFixture() {
        const [admin, founder, investor, auditor] = await ethers.getSigners();

        // 1. Deploy Mocks
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        const usdc = await MockERC20.deploy("USDC", "USDC");
        await usdc.waitForDeployment(); // Hardhat ethers v6

        // 2. Deploy Registries
        const InvestorRegistry = await ethers.getContractFactory("InvestorRegistry");
        const investorRegistry = await upgrades.deployProxy(InvestorRegistry, []);
        await investorRegistry.waitForDeployment();

        // Register the actual investor
        await investorRegistry.connect(investor).registerInvestor("US");
        await investorRegistry.setKYCStatus(investor.address, true, 3600 * 24 * 365);

        const StartupRegistry = await ethers.getContractFactory("StartupRegistry");
        const startupRegistry = await upgrades.deployProxy(StartupRegistry, []);
        await startupRegistry.waitForDeployment();

        // 3. Deploy SAFE Implementation
        const TokenizedSAFE = await ethers.getContractFactory("TokenizedSAFE");
        const safeImpl = await TokenizedSAFE.deploy();
        await safeImpl.waitForDeployment();

        // 4. Configure Protocol
        await startupRegistry.setProtocolConfig(
            await safeImpl.getAddress(),
            await usdc.getAddress(),
            await investorRegistry.getAddress()
        );

        // 5. Register Startup & Create Round
        await startupRegistry.connect(founder).registerStartup("MyStartup", "ipfs://data");
        const startupId = await startupRegistry.getStartupByName("MyStartup");
        await startupRegistry.setKYBStatus(startupId, true);

        // Create Round
        const tx = await startupRegistry.connect(founder).createRound(
            startupId,
            10000000,
            2000,
            100,
            10000,
            86400 * 30
        );
        await tx.wait();

        const safeAddress = (await startupRegistry.getSAFEContracts(startupId))[0];
        const safe = await ethers.getContractAt("TokenizedSAFE", safeAddress);

        // Mint USDC to investor and approve
        await usdc.mint(investor.address, 5000);
        await usdc.connect(investor).approve(safeAddress, 5000);

        return { admin, founder, investor, auditor, usdc, safe, startupRegistry };
    }

    it("Should execute the full milestone lifecycle", async function () {
        const { admin, founder, investor, safe, usdc } = await loadFixture(deployFixture);

        // 1. Investor Invests
        await safe.connect(investor).invest(1000);
        expect(await usdc.balanceOf(await safe.getAddress())).to.equal(1000);

        // 2. Founder Creates Milestone
        await safe.connect(founder).createMilestone("Develop MVP", 500);
        const milestone = await safe.milestones(0);
        expect(milestone.description).to.equal("Develop MVP");
        expect(milestone.amount).to.equal(500);

        // 3. Founder Tries to Withdraw (Should fail)
        await expect(
            safe.connect(founder).withdrawMilestoneFunds(0)
        ).to.be.revertedWith("Milestone not verified");

        // 4. Founder Submits Proof
        await safe.connect(founder).submitMilestoneProof(0, "github.com/pr/123");

        // 5. Admin Verifies (The admin set protocol config, so they are the protocol admin)
        await safe.connect(admin).verifyMilestone(0);

        const milestoneVerified = await safe.milestones(0);
        expect(milestoneVerified.isVerified).to.equal(true);

        // 6. Founder Withdraws (Should success now)
        const founderBalanceBefore = await usdc.balanceOf(founder.address);
        await safe.connect(founder).withdrawMilestoneFunds(0);
        const founderBalanceAfter = await usdc.balanceOf(founder.address);

        expect(founderBalanceAfter - founderBalanceBefore).to.equal(500n);

        // 7. Verify Safe Balance decreased
        expect(await usdc.balanceOf(await safe.getAddress())).to.equal(500n);
    });
});
