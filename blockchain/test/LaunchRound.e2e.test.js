/**
 * LaunchRound.e2e.test.js
 *
 * Full end-to-end simulation of the founder "Launch Round" UI flow using Hardhat
 * dummy accounts (no real wallet / Sepolia needed).
 *
 * Flow:
 *   1. Deploy all contracts fresh (StartupRegistry, TokenizedSAFE impl, MockUSDC, InvestorRegistry)
 *   2. Configure the registry (setProtocolConfig)
 *   3. Founder registers a startup (registerStartup)
 *   4. Admin approves KYB (setKYBStatus)
 *   5. Founder launches a round (createRound)
 *   6. Verify the SAFE clone was deployed and round is readable
 */

import { expect } from "chai";
import hre from "hardhat";
const { ethers, upgrades } = hre;

describe("Launch Round — End-to-End", function () {
    let registry, safeImpl, usdc, investorRegistry;
    let owner, kybAdmin, founder, investor;

    // Matches the UI form defaults
    const CAP       = ethers.parseUnits("1000000", 6);  // $1M valuation cap (USDC, 6 decimals)
    const DISCOUNT  = 2000n;                             // 20.00 % (basis points × 100)
    const MIN_INV   = ethers.parseUnits("100", 6);      // $100
    const MAX_INV   = ethers.parseUnits("25000", 6);    // $25k
    const DURATION  = 90n * 86400n;                     // 90 days in seconds

    before(async function () {
        [owner, kybAdmin, founder, investor] = await ethers.getSigners();

        // ── 1. Deploy MockUSDC ────────────────────────────────────────────────
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        usdc = await MockERC20.deploy("USD Coin", "USDC");
        await usdc.waitForDeployment();
        console.log("  MockUSDC:", await usdc.getAddress());

        // Mint USDC to investor for later invest test
        await usdc.mint(investor.address, ethers.parseUnits("100000", 6));

        // ── 2. Deploy InvestorRegistry (UUPS proxy) ───────────────────────────
        const InvestorRegistry = await ethers.getContractFactory("InvestorRegistry");
        investorRegistry = await upgrades.deployProxy(InvestorRegistry, [], {
            initializer: "initialize",
            kind: "uups",
        });
        await investorRegistry.waitForDeployment();
        console.log("  InvestorRegistry:", await investorRegistry.getAddress());

        // ── 3. Deploy bare TokenizedSAFE implementation ───────────────────────
        const TokenizedSAFE = await ethers.getContractFactory("TokenizedSAFE");
        safeImpl = await TokenizedSAFE.deploy();
        await safeImpl.waitForDeployment();
        console.log("  TokenizedSAFE impl:", await safeImpl.getAddress());

        // ── 4. Deploy StartupRegistry (UUPS proxy) ────────────────────────────
        const StartupRegistry = await ethers.getContractFactory("StartupRegistry");
        registry = await upgrades.deployProxy(StartupRegistry, [], {
            initializer: "initialize",
            kind: "uups",
        });
        await registry.waitForDeployment();
        console.log("  StartupRegistry:", await registry.getAddress());

        // ── 5. Grant KYB_ROLE to kybAdmin ────────────────────────────────────
        const KYB_ROLE = await registry.KYB_ROLE();
        await registry.grantRole(KYB_ROLE, kybAdmin.address);

        // ── 6. setProtocolConfig (links SAFE impl + USDC + InvestorRegistry) ──
        await registry.setProtocolConfig(
            await safeImpl.getAddress(),
            await usdc.getAddress(),
            await investorRegistry.getAddress()
        );
        console.log("  Protocol configured\n");
    });

    // ── Step 3: Register startup ──────────────────────────────────────────────
    describe("Step 1 — Founder registers startup", function () {
        it("emits StartupRegistered and startup is readable", async function () {
            const tx = await registry.connect(founder).registerStartup("LaunchTestCo", "ipfs://test");
            await expect(tx).to.emit(registry, "StartupRegistered");

            const ids = await registry.getStartupsByFounder(founder.address);
            expect(ids.length).to.equal(1);

            const startupId = ids[0];
            const startup = await registry.getStartup(startupId);
            expect(startup.companyName).to.equal("LaunchTestCo");
            expect(startup.founderAddress).to.equal(founder.address);
            expect(startup.isActive).to.be.true;
            expect(startup.kybVerified).to.be.false; // not yet approved
        });

        it("createRound FAILS before KYB is approved", async function () {
            const ids = await registry.getStartupsByFounder(founder.address);
            await expect(
                registry.connect(founder).createRound(ids[0], CAP, DISCOUNT, MIN_INV, MAX_INV, DURATION)
            ).to.be.revertedWith("KYB not verified");
        });
    });

    // ── Step 4: Admin approves KYB ────────────────────────────────────────────
    describe("Step 2 — Admin approves KYB", function () {
        it("kybAdmin can approve KYB", async function () {
            const ids = await registry.getStartupsByFounder(founder.address);
            await expect(
                registry.connect(kybAdmin).setKYBStatus(ids[0], true)
            ).to.emit(registry, "KYBStatusUpdated").withArgs(ids[0], true);

            expect(await registry.isKYBVerified(ids[0])).to.be.true;
        });

        it("non-admin cannot approve KYB", async function () {
            const ids = await registry.getStartupsByFounder(founder.address);
            await expect(
                registry.connect(founder).setKYBStatus(ids[0], true)
            ).to.be.reverted;
        });
    });

    // ── Step 5: Founder launches round ───────────────────────────────────────
    describe("Step 3 — Founder launches round (createRound)", function () {
        let safeAddress;

        it("createRound succeeds after KYB approval", async function () {
            const ids = await registry.getStartupsByFounder(founder.address);
            const tx = await registry.connect(founder).createRound(
                ids[0], CAP, DISCOUNT, MIN_INV, MAX_INV, DURATION
            );
            await expect(tx).to.emit(registry, "RoundCreated");

            const safes = await registry.getSAFEContracts(ids[0]);
            expect(safes.length).to.equal(1);
            safeAddress = safes[0];
            console.log("    SAFE clone deployed at:", safeAddress);
        });

        it("SAFE contract is readable (name, totalSupply/raised, valuationCap)", async function () {
            const ids = await registry.getStartupsByFounder(founder.address);
            const safes = await registry.getSAFEContracts(ids[0]);
            const safeABI = await ethers.getContractAt("TokenizedSAFE", safes[0]);

            const name = await safeABI.name();
            const raised = await safeABI.totalSupply(); // ERC20 totalSupply = total invested
            const cap = await safeABI.valuationCap();

            console.log("    SAFE name:", name);
            console.log("    Raised (totalSupply):", raised.toString(), "USDC-wei");
            console.log("    Cap:", ethers.formatUnits(cap, 6), "USDC");

            expect(raised).to.equal(0n);
            expect(cap).to.equal(CAP);
        });

        it("founder can launch a second round (registry allows multiple SAFEs per startup)", async function () {
            const ids = await registry.getStartupsByFounder(founder.address);
            const tx = await registry.connect(founder).createRound(
                ids[0], CAP, DISCOUNT, MIN_INV, MAX_INV, DURATION
            );
            await expect(tx).to.emit(registry, "RoundCreated");

            const safes = await registry.getSAFEContracts(ids[0]);
            expect(safes.length).to.equal(2);
            console.log("    Total SAFE contracts for startup:", safes.length);
        });
    });

    // ── Step 6: Investor invests ──────────────────────────────────────────────
    describe("Step 4 — Investor invests via SAFE", function () {
        it("investor can approve USDC and call invest()", async function () {
            const ids = await registry.getStartupsByFounder(founder.address);
            const safes = await registry.getSAFEContracts(ids[0]);
            const safe = await ethers.getContractAt("TokenizedSAFE", safes[0]);
            const investAmount = ethers.parseUnits("500", 6); // $500

            // First register investor on InvestorRegistry
            await investorRegistry.connect(investor).registerInvestor("US");

            // Grant KYC_ROLE and certify investor
            // setKYCStatus(address, bool, validityPeriod) — 3 args
            const ONE_YEAR = 365 * 24 * 60 * 60;
            const KYC_ROLE = await investorRegistry.KYC_ROLE();
            await investorRegistry.grantRole(KYC_ROLE, owner.address);
            await investorRegistry.connect(owner).setKYCStatus(investor.address, true, ONE_YEAR);

            // Approve USDC spend
            await usdc.connect(investor).approve(await safe.getAddress(), investAmount);

            // Invest
            const tx = await safe.connect(investor).invest(investAmount);
            await expect(tx).to.emit(safe, "InvestmentReceived");

            const raised = await safe.totalSupply(); // ERC20 totalSupply = total USDC invested (net of fees)
            console.log("    Total raised after investment:", ethers.formatUnits(raised, 6), "USDC");
            expect(raised).to.equal(investAmount);
        });
    });
});
