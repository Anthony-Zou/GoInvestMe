import { expect } from "chai";
import hre from "hardhat";
const { ethers, upgrades } = hre;

describe("TokenizedSAFE", function () {
    let TokenizedSAFE;
    let safe;
    let MockERC20;
    let usdc;
    let MockInvestorRegistry;
    let registry;
    let owner, founder, investor1, investor2, unverifiedInvestor;

    const NAME = "TechCo SAFE";
    const SYMBOL = "SAFE-TCH";
    const CAP = ethers.parseUnits("1000000", 6); // 1M USDC
    const DISCOUNT = 2000; // 20%
    const MIN_INVEST = ethers.parseUnits("1000", 6); // 1000 USDC
    const MAX_INVEST = ethers.parseUnits("50000", 6); // 50k USDC
    const DURATION = 30 * 24 * 60 * 60; // 30 days

    beforeEach(async function () {
        [owner, founder, investor1, investor2, unverifiedInvestor] = await ethers.getSigners();

        // Deploy Mock USDC
        MockERC20 = await ethers.getContractFactory("MockERC20");
        usdc = await MockERC20.deploy("USD Coin", "USDC");
        await usdc.waitForDeployment();

        // Distribute USDC
        await usdc.mint(investor1.address, ethers.parseUnits("100000", 6));
        await usdc.mint(investor2.address, ethers.parseUnits("100000", 6));
        await usdc.mint(unverifiedInvestor.address, ethers.parseUnits("100000", 6));

        // Deploy Mock Investor Registry
        MockInvestorRegistry = await ethers.getContractFactory("MockInvestorRegistry");
        registry = await MockInvestorRegistry.deploy();
        await registry.waitForDeployment();

        // Verify investors
        await registry.setVerified(investor1.address, true);
        await registry.setVerified(investor2.address, true);
        await registry.setVerified(unverifiedInvestor.address, false);

        // Deploy TokenizedSAFE (no fee for base tests)
        TokenizedSAFE = await ethers.getContractFactory("TokenizedSAFE");
        safe = await upgrades.deployProxy(TokenizedSAFE, [
            NAME,
            SYMBOL,
            await usdc.getAddress(),
            await registry.getAddress(),
            founder.address,
            owner.address, // _protocolAdmin
            CAP,
            DISCOUNT,
            MIN_INVEST,
            MAX_INVEST,
            DURATION,
            ethers.ZeroAddress, // _protocolTreasury (disabled)
            0                   // _feeBps (no fee)
        ], {
            initializer: "initialize",
            kind: "uups",
        });
        await safe.waitForDeployment();

        // Approve USDC spending
        await usdc.connect(investor1).approve(await safe.getAddress(), ethers.MaxUint256);
        await usdc.connect(investor2).approve(await safe.getAddress(), ethers.MaxUint256);
        await usdc.connect(unverifiedInvestor).approve(await safe.getAddress(), ethers.MaxUint256);
    });

    describe("Initialization", function () {
        it("Should initialize with correct parameters", async function () {
            expect(await safe.name()).to.equal(NAME);
            expect(await safe.symbol()).to.equal(SYMBOL);
            expect(await safe.usdcToken()).to.equal(await usdc.getAddress());
            expect(await safe.founderAddress()).to.equal(founder.address);
            expect(await safe.valuationCap()).to.equal(CAP);
        });

        it("Should grant DEFAULT_ADMIN_ROLE to protocol admin (owner)", async function () {
            const DEFAULT_ADMIN_ROLE = await safe.DEFAULT_ADMIN_ROLE();
            expect(await safe.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
        });

        it("Should grant ADMIN_ROLE to founder", async function () {
            const ADMIN_ROLE = await safe.ADMIN_ROLE();
            expect(await safe.hasRole(ADMIN_ROLE, founder.address)).to.be.true;
        });
    });

    // ... Investment tests match logic (omitted lines unchanged) ...

    describe("Investment", function () {
        it("Should allow verified investor to invest", async function () {
            const amount = ethers.parseUnits("5000", 6);

            await expect(safe.connect(investor1).invest(amount))
                .to.emit(safe, "InvestmentReceived")
                .withArgs(investor1.address, amount, amount);

            expect(await safe.balanceOf(investor1.address)).to.equal(amount);
            expect(await usdc.balanceOf(await safe.getAddress())).to.equal(amount);
        });

        it("Should reject unverified investor", async function () {
            const amount = ethers.parseUnits("5000", 6);
            await expect(
                safe.connect(unverifiedInvestor).invest(amount)
            ).to.be.revertedWith("Investor not verified");
        });

        it("Should enforce minimum investment", async function () {
            const amount = ethers.parseUnits("500", 6); // Below 1000
            await expect(
                safe.connect(investor1).invest(amount)
            ).to.be.revertedWith("Below min investment");
        });

        it("Should enforce maximum investment", async function () {
            const amount = ethers.parseUnits("60000", 6); // Above 50k
            await expect(
                safe.connect(investor1).invest(amount)
            ).to.be.revertedWith("Exceeds max investment");
        });

        it("Should accumulate investments up to max cap per user", async function () {
            const amount1 = ethers.parseUnits("30000", 6);
            const amount2 = ethers.parseUnits("30000", 6); // Total 60k, exceeds 50k

            await safe.connect(investor1).invest(amount1);

            await expect(
                safe.connect(investor1).invest(amount2)
            ).to.be.revertedWith("Exceeds max investment");
        });
    });

    describe("Fund Management", function () {
        beforeEach(async function () {
            await safe.connect(investor1).invest(ethers.parseUnits("10000", 6));
        });

        it("Should allow protocol admin to emergency withdraw funds", async function () {
            const contractBalance = await usdc.balanceOf(await safe.getAddress());

            // Emergency withdraw to owner
            await expect(safe.connect(owner).emergencyWithdraw(owner.address))
                .to.emit(safe, "FundsWithdrawn")
                .withArgs(owner.address, contractBalance);

            expect(await usdc.balanceOf(await safe.getAddress())).to.equal(0);
        });

        it("Should reject emergency withdrawal by non-admin", async function () {
            await expect(
                safe.connect(investor1).emergencyWithdraw(investor1.address)
            ).to.be.reverted; // AccessControl revert
        });
    });

    describe("Protocol Fee", function () {
        let treasury;

        beforeEach(async function () {
            [,,,,,treasury] = await ethers.getSigners();
        });

        it("Should allow admin to set fee config", async function () {
            await safe.connect(owner).setFeeConfig(treasury.address, 100); // 1%
            expect(await safe.protocolTreasury()).to.equal(treasury.address);
            expect(await safe.feeBps()).to.equal(100);
        });

        it("Should reject fee config from non-admin", async function () {
            await expect(
                safe.connect(founder).setFeeConfig(treasury.address, 100)
            ).to.be.reverted;
        });

        it("Should reject fee above maximum (10%)", async function () {
            await expect(
                safe.connect(owner).setFeeConfig(treasury.address, 1001)
            ).to.be.revertedWith("Fee exceeds maximum");
        });

        it("Should collect fee and emit FeeCollected event on investment", async function () {
            await safe.connect(owner).setFeeConfig(treasury.address, 100); // 1%

            const amount = ethers.parseUnits("10000", 6);
            const expectedFee = amount * 100n / 10000n;    // 100 USDC
            const expectedNet = amount - expectedFee;       // 9900 USDC

            await expect(safe.connect(investor1).invest(amount))
                .to.emit(safe, "FeeCollected")
                .withArgs(treasury.address, expectedFee)
                .and.to.emit(safe, "InvestmentReceived")
                .withArgs(investor1.address, amount, expectedNet);

            expect(await usdc.balanceOf(treasury.address)).to.equal(expectedFee);
            expect(await usdc.balanceOf(await safe.getAddress())).to.equal(expectedNet);
            expect(await safe.balanceOf(investor1.address)).to.equal(expectedNet);
        });

        it("Should not collect fee when feeBps is 0", async function () {
            const amount = ethers.parseUnits("5000", 6);

            await expect(safe.connect(investor1).invest(amount))
                .to.not.emit(safe, "FeeCollected");

            expect(await safe.balanceOf(investor1.address)).to.equal(amount);
        });
    });

    describe("Pausability", function () {
        it("Should pause and unpause investment", async function () {
            await safe.connect(founder).pause();

            await expect(
                safe.connect(investor1).invest(ethers.parseUnits("1000", 6))
            ).to.be.revertedWithCustomError(safe, "EnforcedPause");

            await safe.connect(founder).unpause();

            await expect(
                safe.connect(investor1).invest(ethers.parseUnits("1000", 6))
            ).to.not.be.reverted;
        });
    });
});
