import { expect } from "chai";
import hre from "hardhat";
const { ethers, upgrades } = hre;
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("InvestorRegistry", function () {
    let InvestorRegistry;
    let registry;
    let owner, admin, kycOperator, investor1, investor2, investor3;

    const ONE_YEAR = 365 * 24 * 60 * 60;

    beforeEach(async function () {
        [owner, admin, kycOperator, investor1, investor2, investor3] = await ethers.getSigners();

        InvestorRegistry = await ethers.getContractFactory("InvestorRegistry");
        registry = await upgrades.deployProxy(InvestorRegistry, [], {
            initializer: "initialize",
            kind: "uups",
        });
        await registry.waitForDeployment();

        // Grant roles
        const ADMIN_ROLE = await registry.ADMIN_ROLE();
        const KYC_ROLE = await registry.KYC_ROLE();
        await registry.grantRole(ADMIN_ROLE, admin.address);
        await registry.grantRole(KYC_ROLE, kycOperator.address);
    });

    describe("Investor Registration", function () {
        it("Should register a new investor", async function () {
            await expect(registry.connect(investor1).registerInvestor("US"))
                .to.emit(registry, "InvestorRegistered")
                .withArgs(investor1.address, "US");

            expect(await registry.isInvestorRegistered(investor1.address)).to.be.true;
            expect(await registry.totalInvestors()).to.equal(1);
        });

        it("Should reject duplicate registration", async function () {
            await registry.connect(investor1).registerInvestor("US");

            await expect(
                registry.connect(investor1).registerInvestor("US")
            ).to.be.revertedWith("Already registered");
        });

        it("Should reject invalid jurisdiction code", async function () {
            await expect(
                registry.connect(investor1).registerInvestor("USA")
            ).to.be.revertedWith("Invalid jurisdiction code");

            await expect(
                registry.connect(investor1).registerInvestor("U")
            ).to.be.revertedWith("Invalid jurisdiction code");
        });

        it("Should retrieve investor details", async function () {
            await registry.connect(investor1).registerInvestor("US");

            const investor = await registry.getInvestor(investor1.address);
            expect(investor.jurisdiction).to.equal("US");
            expect(investor.kycVerified).to.be.false;
            expect(investor.accreditation).to.equal(0); // AccreditationLevel.None
            expect(investor.isActive).to.be.true;
        });
    });

    describe("KYC Verification", function () {
        beforeEach(async function () {
            await registry.connect(investor1).registerInvestor("US");
        });

        it("Should set KYC status by KYC operator", async function () {
            await expect(
                registry.connect(kycOperator).setKYCStatus(investor1.address, true, ONE_YEAR)
            ).to.emit(registry, "KYCStatusUpdated");

            const investor = await registry.getInvestor(investor1.address);
            expect(investor.kycVerified).to.be.true;
            expect(investor.kycExpiry).to.be.gt(0);
        });

        it("Should reject KYC update by non-KYC role", async function () {
            await expect(
                registry.connect(investor2).setKYCStatus(investor1.address, true, ONE_YEAR)
            ).to.be.reverted;
        });

        it("Should handle KYC expiry correctly", async function () {
            await registry.connect(kycOperator).setKYCStatus(investor1.address, true, 100); // 100 seconds

            expect(await registry.canInvest(investor1.address, 1000)).to.be.true;

            // Fast forward time
            await time.increase(101);

            expect(await registry.canInvest(investor1.address, 1000)).to.be.false;
        });
    });

    describe("Accreditation", function () {
        beforeEach(async function () {
            await registry.connect(investor1).registerInvestor("US");
            await registry.connect(kycOperator).setKYCStatus(investor1.address, true, ONE_YEAR);
        });

        it("Should set accreditation level", async function () {
            await expect(
                registry.connect(kycOperator).setAccreditation(investor1.address, 2) // Accredited
            ).to.emit(registry, "AccreditationUpdated")
                .withArgs(investor1.address, 2);

            expect(await registry.isAccredited(investor1.address)).to.be.true;
            expect(await registry.totalAccredited()).to.equal(1);
        });

        it("Should update accredited count correctly", async function () {
            // Set to accredited
            await registry.connect(kycOperator).setAccreditation(investor1.address, 2);
            expect(await registry.totalAccredited()).to.equal(1);

            // Set to institutional (should stay counted)
            await registry.connect(kycOperator).setAccreditation(investor1.address, 3);
            expect(await registry.totalAccredited()).to.equal(1);

            // Downgrade to retail (should decrement)
            await registry.connect(kycOperator).setAccreditation(investor1.address, 1);
            expect(await registry.totalAccredited()).to.equal(0);
        });
    });

    describe("Investment Cap", function () {
        beforeEach(async function () {
            await registry.connect(investor1).registerInvestor("US");
            await registry.connect(kycOperator).setKYCStatus(investor1.address, true, ONE_YEAR);
        });

        it("Should set investment cap", async function () {
            const cap = ethers.parseEther("10"); // 10 ETH

            await expect(
                registry.connect(admin).setInvestmentCap(investor1.address, cap)
            ).to.emit(registry, "InvestmentCapUpdated")
                .withArgs(investor1.address, cap);

            const investor = await registry.getInvestor(investor1.address);
            expect(investor.investmentCap).to.equal(cap);
        });

        it("Should enforce investment cap", async function () {
            const cap = ethers.parseEther("10");
            await registry.connect(admin).setInvestmentCap(investor1.address, cap);

            // Can invest below cap
            expect(await registry.canInvest(investor1.address, ethers.parseEther("5"))).to.be.true;

            // Record investment
            await registry.connect(admin).recordInvestment(investor1.address, ethers.parseEther("5"));

            // Can still invest up to cap
            expect(await registry.canInvest(investor1.address, ethers.parseEther("5"))).to.be.true;

            // Cannot exceed cap
            expect(await registry.canInvest(investor1.address, ethers.parseEther("6"))).to.be.false;
        });

        it("Should allow unlimited investment with zero cap", async function () {
            await registry.connect(admin).setInvestmentCap(investor1.address, 0);

            expect(await registry.canInvest(investor1.address, ethers.parseEther("1000000"))).to.be.true;
        });
    });

    describe("Investment Recording", function () {
        beforeEach(async function () {
            await registry.connect(investor1).registerInvestor("US");
            await registry.connect(kycOperator).setKYCStatus(investor1.address, true, ONE_YEAR);
        });

        it("Should record investment", async function () {
            const amount = ethers.parseEther("5");

            await expect(
                registry.connect(admin).recordInvestment(investor1.address, amount)
            ).to.emit(registry, "InvestmentRecorded")
                .withArgs(investor1.address, amount);

            const investor = await registry.getInvestor(investor1.address);
            expect(investor.totalInvested).to.equal(amount);
        });

        it("Should accumulate multiple investments", async function () {
            await registry.connect(admin).recordInvestment(investor1.address, ethers.parseEther("2"));
            await registry.connect(admin).recordInvestment(investor1.address, ethers.parseEther("3"));

            const investor = await registry.getInvestor(investor1.address);
            expect(investor.totalInvested).to.equal(ethers.parseEther("5"));
        });
    });

    describe("Investor Activation", function () {
        beforeEach(async function () {
            await registry.connect(investor1).registerInvestor("US");
            await registry.connect(kycOperator).setKYCStatus(investor1.address, true, ONE_YEAR);
        });

        it("Should deactivate investor", async function () {
            await expect(
                registry.connect(admin).deactivateInvestor(investor1.address)
            ).to.emit(registry, "InvestorDeactivated")
                .withArgs(investor1.address);

            expect(await registry.canInvest(investor1.address, 1000)).to.be.false;
        });

        it("Should reactivate investor", async function () {
            await registry.connect(admin).deactivateInvestor(investor1.address);

            await expect(
                registry.connect(admin).reactivateInvestor(investor1.address)
            ).to.emit(registry, "InvestorReactivated")
                .withArgs(investor1.address);

            expect(await registry.canInvest(investor1.address, 1000)).to.be.true;
        });
    });

    describe("Investor Queries", function () {
        beforeEach(async function () {
            await registry.connect(investor1).registerInvestor("US");
            await registry.connect(investor2).registerInvestor("SG");
            await registry.connect(investor3).registerInvestor("UK");
        });

        it("Should get paginated investor list", async function () {
            const investors = await registry.getInvestors(0, 2);
            expect(investors.length).to.equal(2);
            expect(investors[0]).to.equal(investor1.address);
            expect(investors[1]).to.equal(investor2.address);
        });

        it("Should handle pagination edge cases", async function () {
            const investors = await registry.getInvestors(2, 10); // Offset at last item
            expect(investors.length).to.equal(1);
            expect(investors[0]).to.equal(investor3.address);
        });
    });

    describe("canInvest Checks", function () {
        it("Should reject unregistered investor", async function () {
            expect(await registry.canInvest(investor1.address, 1000)).to.be.false;
        });

        it("Should reject investor without KYC", async function () {
            await registry.connect(investor1).registerInvestor("US");
            expect(await registry.canInvest(investor1.address, 1000)).to.be.false;
        });

        it("Should reject deactivated investor", async function () {
            await registry.connect(investor1).registerInvestor("US");
            await registry.connect(kycOperator).setKYCStatus(investor1.address, true, ONE_YEAR);
            await registry.connect(admin).deactivateInvestor(investor1.address);

            expect(await registry.canInvest(investor1.address, 1000)).to.be.false;
        });

        it("Should accept valid investor", async function () {
            await registry.connect(investor1).registerInvestor("US");
            await registry.connect(kycOperator).setKYCStatus(investor1.address, true, ONE_YEAR);

            expect(await registry.canInvest(investor1.address, 1000)).to.be.true;
        });
    });

    describe("Statistics", function () {
        it("Should track total investors correctly", async function () {
            expect(await registry.totalInvestors()).to.equal(0);

            await registry.connect(investor1).registerInvestor("US");
            expect(await registry.totalInvestors()).to.equal(1);

            await registry.connect(investor2).registerInvestor("SG");
            expect(await registry.totalInvestors()).to.equal(2);
        });

        it("Should track accredited investors correctly", async function () {
            await registry.connect(investor1).registerInvestor("US");
            await registry.connect(investor2).registerInvestor("SG");

            expect(await registry.totalAccredited()).to.equal(0);

            await registry.connect(kycOperator).setAccreditation(investor1.address, 2);
            expect(await registry.totalAccredited()).to.equal(1);

            await registry.connect(kycOperator).setAccreditation(investor2.address, 3);
            expect(await registry.totalAccredited()).to.equal(2);
        });
    });
});
