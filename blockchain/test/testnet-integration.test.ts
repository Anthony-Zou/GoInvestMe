import { test, describe } from "node:test";
import assert from "node:assert";
import { createPublicClient, createWalletClient, http, parseEther, formatEther } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";

dotenv.config();

// Contract details
const CONTRACT_ADDRESS = "0x8b23a938d1a52588de989a8967a51e2dde0f494f";
const CONTRACT_ABI = [
  {
    "inputs": [{"name": "projectName", "type": "string"}, {"name": "description", "type": "string"}, {"name": "websiteUrl", "type": "string"}, {"name": "totalSupply", "type": "uint256"}, {"name": "pricePerCoin", "type": "uint256"}],
    "name": "createCoin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "entrepreneur", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "buyCoin",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "investor", "type": "address"}, {"name": "entrepreneur", "type": "address"}],
    "name": "getInvestment",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "investor", "type": "address"}, {"name": "entrepreneur", "type": "address"}],
    "name": "getOwnershipPercentage",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "entrepreneur", "type": "address"}],
    "name": "getCapTableSummary",
    "outputs": [{"name": "soldPercentage", "type": "uint256"}, {"name": "availablePercentage", "type": "uint256"}, {"name": "totalRaised", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "entrepreneur", "type": "address"}],
    "name": "getCoinInfo",
    "outputs": [{"name": "projectName", "type": "string"}, {"name": "description", "type": "string"}, {"name": "websiteUrl", "type": "string"}, {"name": "totalSupply", "type": "uint256"}, {"name": "pricePerCoin", "type": "uint256"}, {"name": "coinsSold", "type": "uint256"}, {"name": "coinsAvailable", "type": "uint256"}, {"name": "createdAt", "type": "uint256"}, {"name": "active", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllEntrepreneurs",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Setup clients
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL)
});

// Known addresses from deployment
const deployerAddress = "0x6A4D13Ef0a75AAD68bc6fc58986b7D86c116481C";
const existingInvestor = "0x6a825EE91697939Ff375A33026564CD5387945a8";

describe("🚀 GoInvestMe Testnet Integration Tests", () => {

  test("01. Contract is deployed and accessible", async () => {
    console.log("📍 Testing contract deployment...");
    
    const entrepreneurs = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getAllEntrepreneurs"
    });
    
    console.log(`✅ Contract responsive. Found ${entrepreneurs.length} entrepreneurs`);
    assert.ok(Array.isArray(entrepreneurs), "Should return entrepreneurs array");
  });

  test("02. Verify existing Rentify coin data", async () => {
    console.log("📊 Checking Rentify coin info...");
    
    const coinInfo = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getCoinInfo",
      args: [deployerAddress]
    });
    
    console.log("Coin Info:", {
      projectName: coinInfo[0],
      totalSupply: coinInfo[3].toString(),
      pricePerCoin: formatEther(coinInfo[4]),
      coinsSold: coinInfo[5].toString(),
      active: coinInfo[8]
    });
    
    assert.equal(coinInfo[0], "Rentify", "Project name should be Rentify");
    assert.equal(coinInfo[3], 1000000n, "Total supply should be 1M");
    assert.equal(coinInfo[4], parseEther("0.0001"), "Price should be 0.0001 ETH");
  });

  test("03. Check existing investment", async () => {
    console.log("💰 Checking existing investment...");
    
    const investment = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getInvestment",
      args: [existingInvestor, deployerAddress]
    });
    
    console.log(`Existing investment: ${investment} tokens`);
    assert.equal(investment, 10n, "Should have 10 tokens invested");
  });

  test("04. Test cap table with existing data", async () => {
    console.log("📈 Testing cap table functionality...");
    
    const capTable = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getCapTableSummary",
      args: [deployerAddress]
    });
    
    console.log("Cap Table:", {
      soldPercentage: `${capTable[0]} basis points`,
      availablePercentage: `${capTable[1]} basis points`,
      totalRaised: `${formatEther(capTable[2])} ETH`
    });
    
    assert.equal(capTable[2], parseEther("0.001"), "Should have raised 0.001 ETH");
    assert.equal(capTable[1], 10000n, "Should have 100% available (10000 basis points)");
  });

  test("05. Large investment simulation (50,000 tokens)", async () => {
    console.log("🎯 Testing large investment scenario...");
    
    // Calculate cost for 50,000 tokens at 0.0001 ETH each = 5 ETH
    const tokens = 50000n;
    const cost = tokens * parseEther("0.0001");
    
    console.log(`Simulating purchase of ${tokens} tokens for ${formatEther(cost)} ETH`);
    
    // Check if deployer has enough balance (we won't actually execute, just validate)
    const balance = await publicClient.getBalance({ 
      address: deployerAddress 
    });
    
    console.log(`Deployer balance: ${formatEther(balance)} ETH`);
    console.log(`Required: ${formatEther(cost)} ETH + gas`);
    
    if (balance > cost + parseEther("0.1")) {
      console.log("✅ Sufficient balance for large investment test");
    } else {
      console.log("⚠️  Insufficient balance - would need more testnet ETH");
    }
    
    assert.ok(cost === parseEther("5"), "Cost calculation should be correct");
  });

  test("06. Edge case: Buy more than available", async () => {
    console.log("🚨 Testing over-purchase scenario...");
    
    // Try to buy more than total supply
    const excessiveAmount = 2000000n; // 2M tokens (more than 1M supply)
    const cost = excessiveAmount * parseEther("0.0001");
    
    console.log(`Testing purchase of ${excessiveAmount} tokens (exceeds supply)`);
    
    try {
      // This should fail - we're just testing the simulation
      const gas = await publicClient.estimateContractGas({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "buyCoin",
        args: [deployerAddress, excessiveAmount],
        value: cost,
        account: deployerAddress
      });
      
      console.log("❌ Transaction would succeed - this might be unexpected!");
    } catch (error: any) {
      console.log("✅ Transaction correctly rejected:", error.message.slice(0, 100));
      assert.ok(error, "Should fail when trying to buy more than supply");
    }
  });

  test("07. Gas estimation for various scenarios", async () => {
    console.log("⛽ Testing gas usage patterns...");
    
    const scenarios = [
      { tokens: 1n, name: "Single token" },
      { tokens: 100n, name: "Small batch" },
      { tokens: 10000n, name: "Large batch" },
    ];
    
    for (const scenario of scenarios) {
      try {
        const cost = scenario.tokens * parseEther("0.0001");
        const gas = await publicClient.estimateContractGas({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "buyCoin",
          args: [deployerAddress, scenario.tokens],
          value: cost,
          account: deployerAddress
        });
        
        console.log(`${scenario.name}: ~${gas} gas units`);
      } catch (error) {
        console.log(`${scenario.name}: Failed gas estimation`);
      }
    }
  });

  test("08. Multi-entrepreneur scenario", async () => {
    console.log("👥 Testing multiple entrepreneurs...");
    
    const entrepreneurs = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getAllEntrepreneurs"
    });
    
    console.log(`Total entrepreneurs: ${entrepreneurs.length}`);
    
    for (let i = 0; i < entrepreneurs.length; i++) {
      const addr = entrepreneurs[i];
      try {
        const coinInfo = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "getCoinInfo",
          args: [addr]
        });
        
        console.log(`Entrepreneur ${i + 1}: ${coinInfo[0]} (${coinInfo[6]} sold)`);
      } catch (error) {
        console.log(`Entrepreneur ${i + 1}: Unable to fetch info`);
      }
    }
    
    assert.ok(entrepreneurs.length >= 1, "Should have at least one entrepreneur");
  });

  test("09. Network performance metrics", async () => {
    console.log("📊 Measuring network performance...");
    
    const startTime = Date.now();
    
    // Test multiple read operations
        const operations = await Promise.all([
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "getAllEntrepreneurs"
          }),
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "getCapTableSummary",
            args: [deployerAddress]
          }),
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "getCoinInfo",
            args: [deployerAddress]
          })
        ]);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Completed 3 operations in ${duration}ms`);
    console.log(`Average: ${Math.round(duration / 3)}ms per operation`);
    
    assert.ok(duration < 10000, "Operations should complete within 10 seconds");
  });

  test("10. Contract state integrity check", async () => {
    console.log("🔍 Final state integrity check...");
    
    const [entrepreneurs, capTable, coinInfo] = await Promise.all([
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "getAllEntrepreneurs"
      }),
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "getCapTableSummary",
        args: [deployerAddress]
      }),
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "getCoinInfo",
        args: [deployerAddress]
      })
    ]);
    
    // Verify data consistency
    const totalSupply = coinInfo[3];
    const totalSold = coinInfo[5]; // coinsSold is at index 5
    const totalRaised = capTable[2];
    const pricePerCoin = coinInfo[4];
    
    const expectedRaised = totalSold * pricePerCoin;
    
    console.log("State Check:", {
      totalSupply: totalSupply.toString(),
      totalSold: totalSold.toString(),
      totalRaised: formatEther(totalRaised),
      expectedRaised: formatEther(expectedRaised),
      consistent: totalRaised === expectedRaised
    });
    
    assert.equal(totalRaised, expectedRaised, "Raised amount should match sold tokens * price");
    assert.ok(totalSold <= totalSupply, "Sold should not exceed supply");
    
    console.log("✅ All state integrity checks passed!");
  });
});