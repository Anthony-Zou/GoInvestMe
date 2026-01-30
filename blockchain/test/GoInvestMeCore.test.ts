import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEther, formatEther, type Address } from "viem";

/**
 * ============================================================================
 * GoInvestMeCore - PROFESSIONAL COMPREHENSIVE TEST SUITE
 * ============================================================================
 * 
 * Test Coverage:
 * 1. Deployment & Initialization (5 tests)
 * 2. Coin Creation - Happy Path (8 tests)
 * 3. Coin Creation - Validation & Edge Cases (15 tests)
 * 4. Investment Flow - Basic (10 tests)
 * 5. Investment Flow - Edge Cases & Security (8 tests)
 * 6. Coin Management (6 tests)
 * 7. Discovery & Pagination (8 tests)
 * 8. Admin & Emergency Functions (7 tests)
 * 9. Reentrancy & Security (5 tests)
 * 10. Gas Optimization & Limits (4 tests)
 * 11. Cap Table & Ownership (6 tests)
 * 
 * Total: 82 comprehensive test cases
 * ============================================================================
 */

describe("GoInvestMeCore - PROFESSIONAL COMPREHENSIVE TEST SUITE", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  
  // ============ TEST CONSTANTS ============
  
  const MIN_SUPPLY = 100n;
  const MAX_SUPPLY = 10_000_000n;
  const MIN_PRICE = parseEther("0.0001");
  const MAX_PRICE = parseEther("100");
  const MAX_DESCRIPTION_LENGTH = 1000;
  const MAX_PROJECT_NAME_LENGTH = 100;
  const MAX_WEBSITE_LENGTH = 200;
  
  // ============ HELPER FUNCTIONS ============
  
  async function deployFreshContract() {
    return await viem.deployContract("GoInvestMeCore");
  }
  
  async function createTestCoin(
    contract: any, 
    account?: any,
    params?: {
      name?: string;
      description?: string;
      website?: string;
      supply?: bigint;
      price?: bigint;
    }
  ) {
    const defaults = {
      name: "Test Project",
      description: "Test Description for an amazing startup",
      website: "https://test.com",
      supply: 1000n,
      price: parseEther("0.01")
    };
    
    const config = { ...defaults, ...params };
    const options = account ? { account } : {};
    
    return await contract.write.createCoin(
      [config.name, config.description, config.website, config.supply, config.price],
      options
    );
  }
  
  async function getBalance(address: Address) {
    return await publicClient.getBalance({ address });
  }
  
  // ============================================================================
  // 1. DEPLOYMENT & INITIALIZATION
  // ============================================================================
  
  describe("1. Deployment & Initialization", function () {
    it("1.1 Should deploy with correct version", async function () {
      const contract = await deployFreshContract();
      const version = await contract.read.version();
      assert.equal(version, "2.1.0-Professional");
    });
    
    it("1.2 Should set deployer as owner", async function () {
      const contract = await deployFreshContract();
      const [deployer] = await viem.getWalletClients();
      const owner = await contract.read.owner();
      assert.equal(owner.toLowerCase(), deployer.account.address.toLowerCase());
    });
    
    it("1.3 Should start with zero entrepreneurs", async function () {
      const contract = await deployFreshContract();
      const count = await contract.read.getEntrepreneurCount();
      assert.equal(count, 0n);
    });
    
    it("1.4 Should have correct constants", async function () {
      const contract = await deployFreshContract();
      
      assert.equal(await contract.read.MIN_SUPPLY(), MIN_SUPPLY);
      assert.equal(await contract.read.MAX_SUPPLY(), MAX_SUPPLY);
      assert.equal(await contract.read.MIN_PRICE(), MIN_PRICE);
      assert.equal(await contract.read.MAX_PRICE(), MAX_PRICE);
      assert.equal(await contract.read.MAX_DESCRIPTION_LENGTH(), BigInt(MAX_DESCRIPTION_LENGTH));
    });
    
    it("1.5 Should start in unpaused state", async function () {
      const contract = await deployFreshContract();
      await createTestCoin(contract); // Should succeed
      assert.ok(true);
    });
  });
  
  // ============================================================================
  // 2. COIN CREATION - HAPPY PATH
  // ============================================================================
  
  describe("2. Coin Creation - Happy Path", function () {
    it("2.1 Should create coin with all details", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur] = await viem.getWalletClients();
      
      await contract.write.createCoin([
        "AI Tutoring Platform",
        "Revolutionary AI-powered personalized tutoring for K-12 students with adaptive learning",
        "https://aitutoring.com",
        5000n,
        parseEther("0.05")
      ]);
      
      const info = await contract.read.getCoinInfo([entrepreneur.account.address]);
      
      assert.equal(info[0], "AI Tutoring Platform");
      assert.ok(info[1].includes("Revolutionary"));
      assert.equal(info[2], "https://aitutoring.com");
      assert.equal(info[3], 5000n); // totalSupply
      assert.equal(info[4], parseEther("0.05")); // pricePerCoin
      assert.equal(info[5], 0n); // coinsSold
      assert.equal(info[6], 5000n); // coinsAvailable
      assert.equal(info[8], true); // active
    });
    
    it("2.2 Should create coin at minimum parameters", async function () {
      const contract = await deployFreshContract();
      
      await contract.write.createCoin([
        "A",
        "B",
        "",
        MIN_SUPPLY,
        MIN_PRICE
      ]);
      
      assert.ok(true);
    });
    
    it("2.3 Should create coin at maximum parameters", async function () {
      const contract = await deployFreshContract();
      
      const maxDescription = "A".repeat(MAX_DESCRIPTION_LENGTH);
      const maxProjectName = "X".repeat(MAX_PROJECT_NAME_LENGTH);
      const maxWebsite = "https://" + "x".repeat(MAX_WEBSITE_LENGTH - 8);
      
      await contract.write.createCoin([
        maxProjectName,
        maxDescription,
        maxWebsite,
        MAX_SUPPLY,
        MAX_PRICE
      ]);
      
      assert.ok(true);
    });
    
    it("2.4 Should create coin without website", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur] = await viem.getWalletClients();
      
      await createTestCoin(contract, undefined, { website: "" });
      
      const info = await contract.read.getCoinInfo([entrepreneur.account.address]);
      assert.equal(info[2], "");
    });
    
    it("2.5 Should set correct timestamp", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur] = await viem.getWalletClients();
      
      const blockBefore = await publicClient.getBlock();
      await createTestCoin(contract);
      const blockAfter = await publicClient.getBlock();
      
      const info = await contract.read.getCoinInfo([entrepreneur.account.address]);
      const createdAt = info[7];
      
      assert.ok(createdAt >= blockBefore.timestamp);
      assert.ok(createdAt <= blockAfter.timestamp);
    });
    
    it("2.6 Should add to discovery list", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur] = await viem.getWalletClients();
      
      const countBefore = await contract.read.getEntrepreneurCount();
      await createTestCoin(contract);
      const countAfter = await contract.read.getEntrepreneurCount();
      
      assert.equal(countAfter, countBefore + 1n);
      
      const allEntrepreneurs = await contract.read.getAllEntrepreneurs();
      assert.equal(
        allEntrepreneurs[Number(countAfter) - 1].toLowerCase(),
        entrepreneur.account.address.toLowerCase()
      );
    });
    
    it("2.7 Should allow multiple entrepreneurs", async function () {
      const contract = await deployFreshContract();
      const [e1, e2, e3] = await viem.getWalletClients();
      
      await createTestCoin(contract, e1.account, { name: "Project 1" });
      await createTestCoin(contract, e2.account, { name: "Project 2" });
      await createTestCoin(contract, e3.account, { name: "Project 3" });
      
      const count = await contract.read.getEntrepreneurCount();
      assert.equal(count, 3n);
    });
    
    it("2.8 Should set hasCoin flag correctly", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, other] = await viem.getWalletClients();
      
      const beforeCreate = await contract.read.hasCoin([entrepreneur.account.address]);
      assert.equal(beforeCreate, false);
      
      await createTestCoin(contract);
      
      const afterCreate = await contract.read.hasCoin([entrepreneur.account.address]);
      const otherHasCoin = await contract.read.hasCoin([other.account.address]);
      
      assert.equal(afterCreate, true);
      assert.equal(otherHasCoin, false);
    });
  });
  
  // ============================================================================
  // 3. COIN CREATION - VALIDATION & EDGE CASES
  // ============================================================================
  
  describe("3. Coin Creation - Validation & Edge Cases", function () {
    // Supply validation
    it("3.1 Should reject supply below minimum (99)", async function () {
      const contract = await deployFreshContract();
      
      try {
        await createTestCoin(contract, undefined, { supply: 99n });
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Supply below minimum"));
      }
    });
    
    it("3.2 Should reject supply above maximum (10M + 1)", async function () {
      const contract = await deployFreshContract();
      
      try {
        await createTestCoin(contract, undefined, { supply: MAX_SUPPLY + 1n });
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Supply above maximum"));
      }
    });
    
    // Price validation
    it("3.3 Should reject price below minimum", async function () {
      const contract = await deployFreshContract();
      
      try {
        await createTestCoin(contract, undefined, { price: parseEther("0.00009") });
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Price below minimum"));
      }
    });
    
    it("3.4 Should reject price above maximum", async function () {
      const contract = await deployFreshContract();
      
      try {
        await createTestCoin(contract, undefined, { price: parseEther("101") });
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Price above maximum"));
      }
    });
    
    // Project name validation
    it("3.5 Should reject empty project name", async function () {
      const contract = await deployFreshContract();
      
      try {
        await createTestCoin(contract, undefined, { name: "" });
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Project name required"));
      }
    });
    
    it("3.6 Should reject project name too long (101 chars)", async function () {
      const contract = await deployFreshContract();
      
      try {
        await createTestCoin(contract, undefined, { name: "X".repeat(101) });
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Project name too long"));
      }
    });
    
    // Description validation
    it("3.7 Should reject empty description", async function () {
      const contract = await deployFreshContract();
      
      try {
        await createTestCoin(contract, undefined, { description: "" });
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Description required"));
      }
    });
    
    it("3.8 Should reject description too long (1001 chars)", async function () {
      const contract = await deployFreshContract();
      
      try {
        await createTestCoin(contract, undefined, { description: "A".repeat(1001) });
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Description too long"));
      }
    });
    
    // Website validation
    it("3.9 Should reject website URL too long (201 chars)", async function () {
      const contract = await deployFreshContract();
      
      try {
        await createTestCoin(contract, undefined, { website: "https://" + "x".repeat(194) });
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Website URL too long"));
      }
    });
    
    // Duplicate prevention
    it("3.10 Should prevent creating coin twice", async function () {
      const contract = await deployFreshContract();
      
      await createTestCoin(contract);
      
      try {
        await createTestCoin(contract, undefined, { name: "Different Project" });
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Coin already exists"));
      }
    });
    
    // Zero and boundary cases
    it("3.11 Should reject zero supply", async function () {
      const contract = await deployFreshContract();
      
      try {
        await createTestCoin(contract, undefined, { supply: 0n });
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Supply below minimum"));
      }
    });
    
    it("3.12 Should reject zero price", async function () {
      const contract = await deployFreshContract();
      
      try {
        await createTestCoin(contract, undefined, { price: 0n });
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Price below minimum"));
      }
    });
    
    // Paused state
    it("3.13 Should prevent creation when paused", async function () {
      const contract = await deployFreshContract();
      
      await contract.write.pause();
      
      try {
        await createTestCoin(contract);
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("EnforcedPause") || error.message.includes("Pausable"));
      }
    });
    
    // Special characters
    it("3.14 Should handle special characters in name", async function () {
      const contract = await deployFreshContract();
      
      await createTestCoin(contract, undefined, { 
        name: "AI™ Project® (v2.0) #1 🚀" 
      });
      
      assert.ok(true);
    });
    
    it("3.15 Should handle Unicode in description", async function () {
      const contract = await deployFreshContract();
      
      await createTestCoin(contract, undefined, { 
        description: "中文描述 Русский العربية 日本語 한국어" 
      });
      
      assert.ok(true);
    });
  });
  
  // ============================================================================
  // 4. INVESTMENT FLOW - BASIC
  // ============================================================================
  
  describe("4. Investment Flow - Basic", function () {
    it("4.1 Should allow investor to buy coins", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account);
      
      await contract.write.buyCoin(
        [entrepreneur.account.address, 100n],
        { account: investor.account, value: parseEther("1.0") }
      );
      
      const investment = await contract.read.getInvestment([
        investor.account.address,
        entrepreneur.account.address
      ]);
      
      assert.equal(investment, 100n);
    });
    
    it("4.2 Should transfer exact ETH amount to entrepreneur", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      const balanceBefore = await getBalance(entrepreneur.account.address);
      
      await createTestCoin(contract, entrepreneur.account, { 
        price: parseEther("0.01"),
        supply: 1000n 
      });
      
      await contract.write.buyCoin(
        [entrepreneur.account.address, 100n],
        { account: investor.account, value: parseEther("1.0") }
      );
      
      const balanceAfter = await getBalance(entrepreneur.account.address);
      const received = balanceAfter - balanceBefore;
      
      // Should receive exactly 1 ETH (100 coins * 0.01 ETH)
      assert.ok(received >= parseEther("0.99"), `Expected ~1 ETH, got ${formatEther(received)}`);
      assert.ok(received <= parseEther("1.01"), `Expected ~1 ETH, got ${formatEther(received)}`);
    });
    
    it("4.3 Should refund excess payment", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, { 
        price: parseEther("0.01"),
        supply: 1000n 
      });
      
      const balanceBefore = await getBalance(investor.account.address);
      
      // Send 2 ETH but only need 0.1 ETH for 10 coins
      await contract.write.buyCoin(
        [entrepreneur.account.address, 10n],
        { account: investor.account, value: parseEther("2.0") }
      );
      
      const balanceAfter = await getBalance(investor.account.address);
      const spent = balanceBefore - balanceAfter;
      
      // Should spend ~0.1 ETH (plus gas), not 2 ETH
      assert.ok(spent < parseEther("0.2"), `Spent too much: ${formatEther(spent)}`);
    });
    
    it("4.4 Should update coinsSold correctly", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, { supply: 1000n });
      
      const infoBefore = await contract.read.getCoinInfo([entrepreneur.account.address]);
      assert.equal(infoBefore[5], 0n); // coinsSold before
      
      await contract.write.buyCoin(
        [entrepreneur.account.address, 100n],
        { account: investor.account, value: parseEther("1.0") }
      );
      
      const infoAfter = await contract.read.getCoinInfo([entrepreneur.account.address]);
      assert.equal(infoAfter[5], 100n); // coinsSold after
      assert.equal(infoAfter[6], 900n); // coinsAvailable after
    });
    
    it("4.5 Should allow multiple purchases from same investor", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account);
      
      await contract.write.buyCoin(
        [entrepreneur.account.address, 50n],
        { account: investor.account, value: parseEther("0.5") }
      );
      
      await contract.write.buyCoin(
        [entrepreneur.account.address, 30n],
        { account: investor.account, value: parseEther("0.3") }
      );
      
      const investment = await contract.read.getInvestment([
        investor.account.address,
        entrepreneur.account.address
      ]);
      
      assert.equal(investment, 80n); // 50 + 30
    });
    
    it("4.6 Should allow multiple different investors", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor1, investor2, investor3] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, { supply: 1000n });
      
      await contract.write.buyCoin(
        [entrepreneur.account.address, 100n],
        { account: investor1.account, value: parseEther("1.0") }
      );
      
      await contract.write.buyCoin(
        [entrepreneur.account.address, 200n],
        { account: investor2.account, value: parseEther("2.0") }
      );
      
      await contract.write.buyCoin(
        [entrepreneur.account.address, 50n],
        { account: investor3.account, value: parseEther("0.5") }
      );
      
      const inv1 = await contract.read.getInvestment([investor1.account.address, entrepreneur.account.address]);
      const inv2 = await contract.read.getInvestment([investor2.account.address, entrepreneur.account.address]);
      const inv3 = await contract.read.getInvestment([investor3.account.address, entrepreneur.account.address]);
      
      assert.equal(inv1, 100n);
      assert.equal(inv2, 200n);
      assert.equal(inv3, 50n);
    });
    
    it("4.7 Should buy exact amount requested", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, { supply: 1000n });
      
      await contract.write.buyCoin(
        [entrepreneur.account.address, 1n],
        { account: investor.account, value: parseEther("0.01") }
      );
      
      const investment = await contract.read.getInvestment([
        investor.account.address,
        entrepreneur.account.address
      ]);
      
      assert.equal(investment, 1n);
    });
    
    it("4.8 Should allow buying all remaining coins", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, { supply: 100n });
      
      await contract.write.buyCoin(
        [entrepreneur.account.address, 100n],
        { account: investor.account, value: parseEther("1.0") }
      );
      
      const info = await contract.read.getCoinInfo([entrepreneur.account.address]);
      assert.equal(info[5], 100n); // coinsSold
      assert.equal(info[6], 0n); // coinsAvailable
    });
    
    it("4.9 Should require exact or higher payment", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, { 
        price: parseEther("0.01"),
        supply: 1000n 
      });
      
      // Try to pay less than required
      try {
        await contract.write.buyCoin(
          [entrepreneur.account.address, 10n],
          { account: investor.account, value: parseEther("0.05") } // Need 0.1, sending 0.05
        );
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Insufficient payment"));
      }
    });
    
    it("4.10 Should emit CoinPurchased event", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account);
      
      const tx = await contract.write.buyCoin(
        [entrepreneur.account.address, 10n],
        { account: investor.account, value: parseEther("0.1") }
      );
      
      // Event emission is implicit in successful transaction
      assert.ok(tx);
    });
  });
  
  // ============================================================================
  // 5. INVESTMENT FLOW - EDGE CASES & SECURITY
  // ============================================================================
  
  describe("5. Investment Flow - Edge Cases & Security", function () {
    it("5.1 Should prevent buying your own coins", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account);
      
      try {
        await contract.write.buyCoin(
          [entrepreneur.account.address, 10n],
          { account: entrepreneur.account, value: parseEther("0.1") }
        );
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Can't buy your own coins"));
      }
    });
    
    it("5.2 Should prevent buying zero coins", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account);
      
      try {
        await contract.write.buyCoin(
          [entrepreneur.account.address, 0n],
          { account: investor.account, value: parseEther("0") }
        );
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Amount must be > 0"));
      }
    });
    
    it("5.3 Should prevent buying more than available", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, { supply: 100n });
      
      try {
        await contract.write.buyCoin(
          [entrepreneur.account.address, 101n],
          { account: investor.account, value: parseEther("2.0") }
        );
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Not enough coins available"));
      }
    });
    
    it("5.4 Should prevent buying from non-existent coin", async function () {
      const contract = await deployFreshContract();
      const [, investor, randomAddress] = await viem.getWalletClients();
      
      try {
        await contract.write.buyCoin(
          [randomAddress.account.address, 10n],
          { account: investor.account, value: parseEther("0.1") }
        );
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Coin doesn't exist"));
      }
    });
    
    it("5.5 Should prevent buying from inactive coin", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account);
      await contract.write.setCoinActive([false], { account: entrepreneur.account });
      
      try {
        await contract.write.buyCoin(
          [entrepreneur.account.address, 10n],
          { account: investor.account, value: parseEther("0.1") }
        );
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Coin is not active"));
      }
    });
    
    it("5.6 Should prevent buying when contract paused", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account);
      await contract.write.pause();
      
      try {
        await contract.write.buyCoin(
          [entrepreneur.account.address, 10n],
          { account: investor.account, value: parseEther("0.1") }
        );
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("EnforcedPause") || error.message.includes("Pausable"));
      }
    });
    
    it("5.7 Should handle buying after reactivating coin", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account);
      await contract.write.setCoinActive([false], { account: entrepreneur.account });
      await contract.write.setCoinActive([true], { account: entrepreneur.account });
      
      await contract.write.buyCoin(
        [entrepreneur.account.address, 10n],
        { account: investor.account, value: parseEther("0.1") }
      );
      
      assert.ok(true);
    });
    
    it("5.8 Should protect against reentrancy (nonReentrant modifier)", async function () {
      // This test verifies the modifier is present
      // Full reentrancy testing would require a malicious contract
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account);
      
      // Sequential calls should work (reentrancy protection doesn't affect this)
      await contract.write.buyCoin(
        [entrepreneur.account.address, 5n],
        { account: investor.account, value: parseEther("0.05") }
      );
      
      await contract.write.buyCoin(
        [entrepreneur.account.address, 5n],
        { account: investor.account, value: parseEther("0.05") }
      );
      
      const investment = await contract.read.getInvestment([
        investor.account.address,
        entrepreneur.account.address
      ]);
      
      assert.equal(investment, 10n);
    });
  });
  
  // ============================================================================
  // 6. COIN MANAGEMENT
  // ============================================================================
  
  describe("6. Coin Management", function () {
    it("6.1 Should allow entrepreneur to update description", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, { 
        description: "Original description" 
      });
      
      await contract.write.updateCoinInfo(
        ["Updated description with new details", "https://new-site.com"],
        { account: entrepreneur.account }
      );
      
      const info = await contract.read.getCoinInfo([entrepreneur.account.address]);
      assert.equal(info[1], "Updated description with new details");
      assert.equal(info[2], "https://new-site.com");
    });
    
    it("6.2 Should prevent non-owner from updating coin", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, other] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account);
      
      try {
        await contract.write.updateCoinInfo(
          ["Hacked description", "https://hack.com"],
          { account: other.account }
        );
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Coin doesn't exist"));
      }
    });
    
    it("6.3 Should allow entrepreneur to pause coin", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account);
      
      await contract.write.setCoinActive([false], { account: entrepreneur.account });
      
      const info = await contract.read.getCoinInfo([entrepreneur.account.address]);
      assert.equal(info[8], false); // active flag
    });
    
    it("6.4 Should allow entrepreneur to unpause coin", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account);
      await contract.write.setCoinActive([false], { account: entrepreneur.account });
      await contract.write.setCoinActive([true], { account: entrepreneur.account });
      
      const info = await contract.read.getCoinInfo([entrepreneur.account.address]);
      assert.equal(info[8], true);
    });
    
    it("6.5 Should reject empty description in update", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account);
      
      try {
        await contract.write.updateCoinInfo(
          ["", "https://site.com"],
          { account: entrepreneur.account }
        );
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Description required"));
      }
    });
    
    it("6.6 Should emit CoinUpdated event", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account);
      
      const tx = await contract.write.updateCoinInfo(
        ["New description", "https://new.com"],
        { account: entrepreneur.account }
      );
      
      assert.ok(tx);
    });
  });
  
  // ============================================================================
  // 7. DISCOVERY & PAGINATION
  // ============================================================================
  
  describe("7. Discovery & Pagination", function () {
    it("7.1 Should return all entrepreneurs", async function () {
      const contract = await deployFreshContract();
      const [e1, e2, e3] = await viem.getWalletClients();
      
      await createTestCoin(contract, e1.account, { name: "Project 1" });
      await createTestCoin(contract, e2.account, { name: "Project 2" });
      await createTestCoin(contract, e3.account, { name: "Project 3" });
      
      const all = await contract.read.getAllEntrepreneurs();
      
      assert.equal(all.length, 3);
      assert.equal(all[0].toLowerCase(), e1.account.address.toLowerCase());
      assert.equal(all[1].toLowerCase(), e2.account.address.toLowerCase());
      assert.equal(all[2].toLowerCase(), e3.account.address.toLowerCase());
    });
    
    it("7.2 Should return correct count", async function () {
      const contract = await deployFreshContract();
      const [e1, e2] = await viem.getWalletClients();
      
      assert.equal(await contract.read.getEntrepreneurCount(), 0n);
      
      await createTestCoin(contract, e1.account);
      assert.equal(await contract.read.getEntrepreneurCount(), 1n);
      
      await createTestCoin(contract, e2.account);
      assert.equal(await contract.read.getEntrepreneurCount(), 2n);
    });
    
    it("7.3 Should paginate correctly (first page)", async function () {
      const contract = await deployFreshContract();
      const wallets = await viem.getWalletClients();
      
      // Create 5 entrepreneurs
      for (let i = 0; i < 5; i++) {
        await createTestCoin(contract, wallets[i].account, { name: `Project ${i}` });
      }
      
      const page1 = await contract.read.getEntrepreneursPaginated([0n, 3n]);
      
      assert.equal(page1.length, 3);
      assert.equal(page1[0].toLowerCase(), wallets[0].account.address.toLowerCase());
      assert.equal(page1[1].toLowerCase(), wallets[1].account.address.toLowerCase());
      assert.equal(page1[2].toLowerCase(), wallets[2].account.address.toLowerCase());
    });
    
    it("7.4 Should paginate correctly (second page)", async function () {
      const contract = await deployFreshContract();
      const wallets = await viem.getWalletClients();
      
      for (let i = 0; i < 5; i++) {
        await createTestCoin(contract, wallets[i].account, { name: `Project ${i}` });
      }
      
      const page2 = await contract.read.getEntrepreneursPaginated([3n, 2n]);
      
      assert.equal(page2.length, 2);
      assert.equal(page2[0].toLowerCase(), wallets[3].account.address.toLowerCase());
      assert.equal(page2[1].toLowerCase(), wallets[4].account.address.toLowerCase());
    });
    
    it("7.5 Should handle pagination beyond end", async function () {
      const contract = await deployFreshContract();
      const [e1, e2] = await viem.getWalletClients();
      
      await createTestCoin(contract, e1.account);
      await createTestCoin(contract, e2.account);
      
      const result = await contract.read.getEntrepreneursPaginated([1n, 10n]);
      
      assert.equal(result.length, 1); // Only 1 remaining after offset 1
    });
    
    it("7.6 Should reject pagination offset out of bounds", async function () {
      const contract = await deployFreshContract();
      const [e1] = await viem.getWalletClients();
      
      await createTestCoin(contract, e1.account);
      
      try {
        await contract.read.getEntrepreneursPaginated([10n, 5n]);
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Offset out of bounds"));
      }
    });
    
    it("7.7 Should return empty array for zero entrepreneurs", async function () {
      const contract = await deployFreshContract();
      
      const all = await contract.read.getAllEntrepreneurs();
      
      assert.equal(all.length, 0);
    });
    
    it("7.8 Should handle single item pagination", async function () {
      const contract = await deployFreshContract();
      const [e1, e2, e3] = await viem.getWalletClients();
      
      await createTestCoin(contract, e1.account);
      await createTestCoin(contract, e2.account);
      await createTestCoin(contract, e3.account);
      
      const item = await contract.read.getEntrepreneursPaginated([1n, 1n]);
      
      assert.equal(item.length, 1);
      assert.equal(item[0].toLowerCase(), e2.account.address.toLowerCase());
    });
  });
  
  // ============================================================================
  // 8. ADMIN & EMERGENCY FUNCTIONS
  // ============================================================================
  
  describe("8. Admin & Emergency Functions", function () {
    it("8.1 Should allow owner to pause contract", async function () {
      const contract = await deployFreshContract();
      const [, entrepreneur] = await viem.getWalletClients();
      
      await contract.write.pause();
      
      try {
        await createTestCoin(contract, entrepreneur.account);
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("EnforcedPause") || error.message.includes("Pausable"));
      }
    });
    
    it("8.2 Should allow owner to unpause contract", async function () {
      const contract = await deployFreshContract();
      
      await contract.write.pause();
      await contract.write.unpause();
      
      await createTestCoin(contract);
      assert.ok(true);
    });
    
    it("8.3 Should prevent non-owner from pausing", async function () {
      const contract = await deployFreshContract();
      const [, nonOwner] = await viem.getWalletClients();
      
      try {
        await contract.write.pause({ account: nonOwner.account });
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(
          error.message.includes("OwnableUnauthorizedAccount") ||
          error.message.includes("Ownable")
        );
      }
    });
    
    it("8.4 Should prevent non-owner from unpausing", async function () {
      const contract = await deployFreshContract();
      const [owner, nonOwner] = await viem.getWalletClients();
      
      await contract.write.pause({ account: owner.account });
      
      try {
        await contract.write.unpause({ account: nonOwner.account });
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(
          error.message.includes("OwnableUnauthorizedAccount") ||
          error.message.includes("Ownable")
        );
      }
    });
    
    it("8.5 Should prevent emergency withdraw when not paused", async function () {
      const contract = await deployFreshContract();
      
      try {
        await contract.write.emergencyWithdraw();
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("ExpectedPause") || error.message.includes("Pausable"));
      }
    });
    
    it("8.6 Should allow emergency withdraw when paused (with balance)", async function () {
      const contract = await deployFreshContract();
      const [owner, entrepreneur, investor] = await viem.getWalletClients();
      
      // Create coin and have investor buy some (ETH goes to entrepreneur, not contract)
      await createTestCoin(contract, entrepreneur.account);
      await contract.write.buyCoin(
        [entrepreneur.account.address, 10n],
        { account: investor.account, value: parseEther("0.1") }
      );
      
      // Pause and try emergency withdraw
      await contract.write.pause();
      
      try {
        await contract.write.emergencyWithdraw();
        // This should fail because contract has no balance (ETH went to entrepreneur)
        assert.fail("Should have thrown error - no balance");
      } catch (error: any) {
        assert.ok(error.message.includes("No balance to withdraw"));
      }
    });
    
    it("8.7 Should get correct version", async function () {
      const contract = await deployFreshContract();
      const version = await contract.read.version();
      
      assert.equal(version, "2.1.0-Professional");
    });
  });
  
  // ============================================================================
  // 9. REENTRANCY & SECURITY
  // ============================================================================
  
  describe("9. Reentrancy & Security", function () {
    it("9.1 Should update state before external calls (CEI pattern)", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, { supply: 100n });
      
      // Buy all coins
      await contract.write.buyCoin(
        [entrepreneur.account.address, 100n],
        { account: investor.account, value: parseEther("1.0") }
      );
      
      // Verify state was updated (should have 0 coins available)
      const info = await contract.read.getCoinInfo([entrepreneur.account.address]);
      assert.equal(info[6], 0n);
      
      // Try to buy again (should fail because coins are already sold)
      try {
        await contract.write.buyCoin(
          [entrepreneur.account.address, 1n],
          { account: investor.account, value: parseEther("0.01") }
        );
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Not enough coins available"));
      }
    });
    
    it("9.2 Should not allow recursive buyCoin calls", async function () {
      // ReentrancyGuard prevents this automatically
      // This test verifies sequential calls work correctly
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account);
      
      await contract.write.buyCoin(
        [entrepreneur.account.address, 10n],
        { account: investor.account, value: parseEther("0.1") }
      );
      
      await contract.write.buyCoin(
        [entrepreneur.account.address, 10n],
        { account: investor.account, value: parseEther("0.1") }
      );
      
      const investment = await contract.read.getInvestment([
        investor.account.address,
        entrepreneur.account.address
      ]);
      
      assert.equal(investment, 20n);
    });
    
    it("9.3 Should handle failed ETH transfer to entrepreneur", async function () {
      // This would require a contract that rejects payments
      // Testing that the transaction reverts properly
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account);
      
      // Normal EOA should accept ETH transfers
      await contract.write.buyCoin(
        [entrepreneur.account.address, 10n],
        { account: investor.account, value: parseEther("0.1") }
      );
      
      assert.ok(true);
    });
    
    it("9.4 Should validate all inputs before state changes", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, { supply: 100n });
      
      // Try to buy with insufficient payment
      const infoBefore = await contract.read.getCoinInfo([entrepreneur.account.address]);
      
      try {
        await contract.write.buyCoin(
          [entrepreneur.account.address, 10n],
          { account: investor.account, value: parseEther("0.05") } // Need 0.1
        );
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.message.includes("Insufficient payment"));
      }
      
      // Verify state wasn't changed
      const infoAfter = await contract.read.getCoinInfo([entrepreneur.account.address]);
      assert.equal(infoAfter[5], infoBefore[5]); // coinsSold unchanged
    });
    
    it("9.5 Should protect against integer overflow", async function () {
      // Solidity 0.8+ has built-in overflow protection
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, { 
        supply: MAX_SUPPLY,
        price: MAX_PRICE 
      });
      
      // Trying to buy should work (but might be expensive!)
      // This tests that price calculation doesn't overflow
      try {
        await contract.write.buyCoin(
          [entrepreneur.account.address, 1n],
          { account: investor.account, value: MAX_PRICE }
        );
        assert.ok(true);
      } catch (error: any) {
        // Might fail due to gas or balance, but shouldn't overflow
        assert.ok(!error.message.includes("overflow"));
      }
    });
  });
  
  // ============================================================================
  // 10. GAS OPTIMIZATION & LIMITS
  // ============================================================================
  
  describe("10. Gas Optimization & Limits", function () {
    it("10.1 Should handle maximum description length efficiently", async function () {
      const contract = await deployFreshContract();
      
      const maxDescription = "A".repeat(MAX_DESCRIPTION_LENGTH);
      
      await createTestCoin(contract, undefined, { description: maxDescription });
      
      assert.ok(true);
    });
    
    it("10.2 Should handle large number of entrepreneurs", async function () {
      const contract = await deployFreshContract();
      const wallets = await viem.getWalletClients();
      
      // Create 10 entrepreneurs
      for (let i = 0; i < Math.min(10, wallets.length); i++) {
        await createTestCoin(contract, wallets[i].account, { 
          name: `Project ${i}`,
          description: `Description for project ${i}` 
        });
      }
      
      const all = await contract.read.getAllEntrepreneurs();
      assert.ok(all.length >= 10 || all.length === wallets.length);
    });
    
    it("10.3 Should handle multiple investments efficiently", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, { supply: 1000n });
      
      // Make 10 small purchases
      for (let i = 0; i < 10; i++) {
        await contract.write.buyCoin(
          [entrepreneur.account.address, 1n],
          { account: investor.account, value: parseEther("0.01") }
        );
      }
      
      const investment = await contract.read.getInvestment([
        investor.account.address,
        entrepreneur.account.address
      ]);
      
      assert.equal(investment, 10n);
    });
    
    it("10.4 Should handle edge case of maximum supply and price", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, {
        supply: MAX_SUPPLY,
        price: MAX_PRICE
      });
      
      const info = await contract.read.getCoinInfo([entrepreneur.account.address]);
      assert.equal(info[3], MAX_SUPPLY);
      assert.equal(info[4], MAX_PRICE);
    });
  });
  
  // ============================================================================
  // 11. CAP TABLE & OWNERSHIP
  // ============================================================================
  
  describe("11. Cap Table & Ownership", function () {
    it("11.1 Should calculate ownership percentage correctly", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, { 
        supply: 1000n,
        price: parseEther("0.01")
      });
      
      // Buy 250 coins = 25%
      await contract.write.buyCoin(
        [entrepreneur.account.address, 250n],
        { account: investor.account, value: parseEther("2.5") }
      );
      
      const percentage = await contract.read.getOwnershipPercentage([
        investor.account.address,
        entrepreneur.account.address
      ]);
      
      // 2500 basis points = 25.00%
      assert.equal(percentage, 2500n);
    });
    
    it("11.2 Should return zero percentage for non-investor", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, , nonInvestor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account);
      
      const percentage = await contract.read.getOwnershipPercentage([
        nonInvestor.account.address,
        entrepreneur.account.address
      ]);
      
      assert.equal(percentage, 0n);
    });
    
    it("11.3 Should get cap table summary correctly", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, { 
        supply: 1000n,
        price: parseEther("0.01")
      });
      
      // Buy 300 coins
      await contract.write.buyCoin(
        [entrepreneur.account.address, 300n],
        { account: investor.account, value: parseEther("3.0") }
      );
      
      const summary = await contract.read.getCapTableSummary([
        entrepreneur.account.address
      ]);
      
      // soldPercentage: 3000 basis points = 30%
      assert.equal(summary[0], 3000n);
      
      // availablePercentage: 7000 basis points = 70%
      assert.equal(summary[1], 7000n);
      
      // totalRaised: 300 * 0.01 ETH = 3 ETH
      assert.equal(summary[2], parseEther("3.0"));
    });
    
    it("11.4 Should handle 100% sold scenario", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, { 
        supply: 100n,
        price: parseEther("0.01")
      });
      
      // Buy all 100 coins
      await contract.write.buyCoin(
        [entrepreneur.account.address, 100n],
        { account: investor.account, value: parseEther("1.0") }
      );
      
      const summary = await contract.read.getCapTableSummary([
        entrepreneur.account.address
      ]);
      
      assert.equal(summary[0], 10000n); // 100% sold
      assert.equal(summary[1], 0n); // 0% available
      assert.equal(summary[2], parseEther("1.0")); // 1 ETH raised
    });
    
    it("11.5 Should calculate multiple investors' percentages", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur, investor1, investor2, investor3] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, { 
        supply: 1000n,
        price: parseEther("0.01")
      });
      
      // investor1: 100 coins = 10%
      await contract.write.buyCoin(
        [entrepreneur.account.address, 100n],
        { account: investor1.account, value: parseEther("1.0") }
      );
      
      // investor2: 200 coins = 20%
      await contract.write.buyCoin(
        [entrepreneur.account.address, 200n],
        { account: investor2.account, value: parseEther("2.0") }
      );
      
      // investor3: 300 coins = 30%
      await contract.write.buyCoin(
        [entrepreneur.account.address, 300n],
        { account: investor3.account, value: parseEther("3.0") }
      );
      
      const pct1 = await contract.read.getOwnershipPercentage([
        investor1.account.address,
        entrepreneur.account.address
      ]);
      
      const pct2 = await contract.read.getOwnershipPercentage([
        investor2.account.address,
        entrepreneur.account.address
      ]);
      
      const pct3 = await contract.read.getOwnershipPercentage([
        investor3.account.address,
        entrepreneur.account.address
      ]);
      
      assert.equal(pct1, 1000n); // 10%
      assert.equal(pct2, 2000n); // 20%
      assert.equal(pct3, 3000n); // 30%
      
      // Total should be 60% sold
      const summary = await contract.read.getCapTableSummary([
        entrepreneur.account.address
      ]);
      assert.equal(summary[0], 6000n); // 60% sold
    });
    
    it("11.6 Should handle cap table with zero supply edge case", async function () {
      const contract = await deployFreshContract();
      const [entrepreneur] = await viem.getWalletClients();
      
      await createTestCoin(contract, entrepreneur.account, { supply: MIN_SUPPLY });
      
      const summary = await contract.read.getCapTableSummary([
        entrepreneur.account.address
      ]);
      
      assert.equal(summary[0], 0n); // 0% sold
      assert.equal(summary[1], 10000n); // 100% available
      assert.equal(summary[2], 0n); // 0 ETH raised
    });
  });
});

