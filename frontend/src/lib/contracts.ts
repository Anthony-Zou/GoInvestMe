import StartupRegistryABI from './abis/StartupRegistry.json'
import TokenizedSAFEABI from './abis/TokenizedSAFE.json'
import InvestorRegistryABI from './abis/InvestorRegistry.json'

export { StartupRegistryABI, TokenizedSAFEABI, InvestorRegistryABI }

export const CONTRACTS = {
  startupRegistry:  '0xE4a56B8F0EEabDf2b10da8f04bBeE249bC1411b9',
  investorRegistry: '0xf62012971644baBEE365fdFc09f03681fDa80378', // TestnetVerifier — always verified
  mockUsdc:         '0xb24a0E87A06f6Aa72A9b81d5452e839E3617c914',
} as const

// Minimal ERC20 ABI for approve + balanceOf + allowance
export const ERC20ABI = [
  { name: 'balanceOf',  type: 'function', stateMutability: 'view',       inputs: [{ name: 'account', type: 'address' }],                                          outputs: [{ type: 'uint256' }] },
  { name: 'allowance',  type: 'function', stateMutability: 'view',       inputs: [{ name: 'owner',   type: 'address' }, { name: 'spender', type: 'address' }],    outputs: [{ type: 'uint256' }] },
  { name: 'approve',    type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'value',   type: 'uint256' }],    outputs: [{ type: 'bool'    }] },
  { name: 'mint',       type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to',      type: 'address' }, { name: 'amount',  type: 'uint256' }],    outputs: [] },
  { name: 'decimals',   type: 'function', stateMutability: 'view',       inputs: [],                                                                              outputs: [{ type: 'uint8'   }] },
] as const
