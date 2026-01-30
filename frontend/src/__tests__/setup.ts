import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock wagmi entirely to avoid import issues
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useReadContract: vi.fn(),
  useWriteContract: vi.fn(),
  useWaitForTransactionReceipt: vi.fn(),
  useConnect: vi.fn(),
  useDisconnect: vi.fn(),
  createConfig: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  WagmiProvider: ({ children }: any) => children,
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }: any) => children,
}))

// Mock viem
vi.mock('viem', () => ({
  parseEther: vi.fn((value) => BigInt(parseFloat(value) * 1e18)),
  formatEther: vi.fn((value) => (Number(value) / 1e18).toString()),
  createPublicClient: vi.fn(),
  http: vi.fn(),
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Next.js Link component
vi.mock('next/link', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MockedLink = ({ children, href, ...props }: any) => {
    const React = require('react')
    return React.createElement('a', { href, ...props }, children)
  }
  MockedLink.displayName = 'MockedLink'
  return { default: MockedLink }
})

// Global test setup
 
global.Request = class Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public url: string, options?: any) { }
}

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: vi.fn().mockImplementation((query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TextEncoder, TextDecoder } = require('util')

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.open
Object.defineProperty(window, 'open', {
  value: vi.fn(),
  writable: true
})