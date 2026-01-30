import { describe, it, expect } from 'vitest'

describe('Basic Test Suite', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle strings', () => {
    expect('hello world').toContain('world')
  })
})