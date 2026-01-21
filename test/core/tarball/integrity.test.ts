/**
 * Integrity Module Tests
 *
 * Tests for Subresource Integrity (SRI) compatible hashing functionality.
 * Covers calculateIntegrity, verifyIntegrity, parseIntegrity, createMultipleIntegrity,
 * getStrongestHash, integrityEquals, and IntegrityStream.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  calculateIntegrity,
  verifyIntegrity,
  parseIntegrity,
  createMultipleIntegrity,
  getStrongestHash,
  integrityEquals,
  IntegrityStream,
  base64ToArrayBuffer,
  type IntegrityHash,
  type HashAlgorithm,
} from '../../../core/tarball/integrity'

const textEncoder = new TextEncoder()

// ============================================================================
// 1. calculateIntegrity
// ============================================================================
describe('calculateIntegrity', () => {
  describe('sha512', () => {
    it('should calculate sha512 hash', async () => {
      const data = textEncoder.encode('hello world')
      const hash = await calculateIntegrity(data, 'sha512')

      expect(hash).toMatch(/^sha512-[A-Za-z0-9+/]+=*$/)
    })

    it('should produce consistent hashes for same input', async () => {
      const data = textEncoder.encode('test content')
      const hash1 = await calculateIntegrity(data, 'sha512')
      const hash2 = await calculateIntegrity(data, 'sha512')

      expect(hash1).toBe(hash2)
    })

    it('should produce different hashes for different input', async () => {
      const data1 = textEncoder.encode('hello')
      const data2 = textEncoder.encode('world')
      const hash1 = await calculateIntegrity(data1, 'sha512')
      const hash2 = await calculateIntegrity(data2, 'sha512')

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('sha256', () => {
    it('should calculate sha256 hash', async () => {
      const data = textEncoder.encode('hello world')
      const hash = await calculateIntegrity(data, 'sha256')

      expect(hash).toMatch(/^sha256-[A-Za-z0-9+/]+=*$/)
    })

    it('should produce shorter hash than sha512', async () => {
      const data = textEncoder.encode('test')
      const sha256 = await calculateIntegrity(data, 'sha256')
      const sha512 = await calculateIntegrity(data, 'sha512')

      // sha256 is 256 bits = 32 bytes, sha512 is 512 bits = 64 bytes
      // Base64 encoded lengths will differ
      const sha256Base64 = sha256.replace('sha256-', '')
      const sha512Base64 = sha512.replace('sha512-', '')
      expect(sha256Base64.length).toBeLessThan(sha512Base64.length)
    })
  })

  describe('sha1', () => {
    it('should calculate sha1 hash (legacy)', async () => {
      const data = textEncoder.encode('hello world')
      const hash = await calculateIntegrity(data, 'sha1')

      expect(hash).toMatch(/^sha1-[A-Za-z0-9+/]+=*$/)
    })
  })

  describe('edge cases', () => {
    it('should handle empty data', async () => {
      const data = new Uint8Array(0)
      const hash = await calculateIntegrity(data, 'sha512')

      expect(hash).toMatch(/^sha512-/)
    })

    it('should handle large data', async () => {
      const data = new Uint8Array(1024 * 1024) // 1MB
      const hash = await calculateIntegrity(data, 'sha512')

      expect(hash).toMatch(/^sha512-/)
    })

    it('should handle binary data', async () => {
      const data = new Uint8Array([0x00, 0x01, 0x02, 0xff, 0xfe, 0xfd])
      const hash = await calculateIntegrity(data, 'sha512')

      expect(hash).toMatch(/^sha512-/)
    })
  })
})

// ============================================================================
// 2. verifyIntegrity
// ============================================================================
describe('verifyIntegrity', () => {
  describe('valid hashes', () => {
    it('should verify matching sha512 hash', async () => {
      const data = textEncoder.encode('hello')
      const hash = await calculateIntegrity(data, 'sha512')

      const valid = await verifyIntegrity(data, hash)

      expect(valid).toBe(true)
    })

    it('should verify matching sha256 hash', async () => {
      const data = textEncoder.encode('world')
      const hash = await calculateIntegrity(data, 'sha256')

      const valid = await verifyIntegrity(data, hash)

      expect(valid).toBe(true)
    })

    it('should verify matching sha1 hash', async () => {
      const data = textEncoder.encode('test')
      const hash = await calculateIntegrity(data, 'sha1')

      const valid = await verifyIntegrity(data, hash)

      expect(valid).toBe(true)
    })
  })

  describe('invalid hashes', () => {
    it('should reject non-matching hash', async () => {
      const data = textEncoder.encode('original')
      const wrongHash = 'sha512-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

      const valid = await verifyIntegrity(data, wrongHash)

      expect(valid).toBe(false)
    })

    it('should reject tampered content', async () => {
      const original = textEncoder.encode('original')
      const hash = await calculateIntegrity(original, 'sha512')

      const tampered = textEncoder.encode('tampered')
      const valid = await verifyIntegrity(tampered, hash)

      expect(valid).toBe(false)
    })
  })

  describe('SSRI format', () => {
    it('should verify when any hash matches (multiple hashes)', async () => {
      const data = textEncoder.encode('test')
      const hash512 = await calculateIntegrity(data, 'sha512')
      const hash256 = await calculateIntegrity(data, 'sha256')
      const multiHash = `${hash512} ${hash256}`

      const valid = await verifyIntegrity(data, multiHash)

      expect(valid).toBe(true)
    })

    it('should verify with only one matching hash', async () => {
      const data = textEncoder.encode('test')
      const validHash = await calculateIntegrity(data, 'sha512')
      const invalidHash = 'sha256-invalid-hash-here'
      const multiHash = `${invalidHash} ${validHash}`

      const valid = await verifyIntegrity(data, multiHash)

      expect(valid).toBe(true)
    })

    it('should reject when no hashes match', async () => {
      const data = textEncoder.encode('test')
      const multiHash = 'sha512-invalid1 sha256-invalid2'

      const valid = await verifyIntegrity(data, multiHash)

      expect(valid).toBe(false)
    })

    it('should handle whitespace in SSRI format', async () => {
      const data = textEncoder.encode('test')
      const hash = await calculateIntegrity(data, 'sha512')
      const hashWithSpaces = `  ${hash}  `

      const valid = await verifyIntegrity(data, hashWithSpaces)

      expect(valid).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle empty data verification', async () => {
      const data = new Uint8Array(0)
      const hash = await calculateIntegrity(data, 'sha512')

      const valid = await verifyIntegrity(data, hash)

      expect(valid).toBe(true)
    })

    it('should skip invalid algorithm formats', async () => {
      const data = textEncoder.encode('test')
      // Invalid format should be skipped, not cause error
      const invalidFormat = 'md5-invalidhash sha512-alsoinvalid'

      const valid = await verifyIntegrity(data, invalidFormat)

      expect(valid).toBe(false)
    })
  })
})

// ============================================================================
// 3. parseIntegrity
// ============================================================================
describe('parseIntegrity', () => {
  describe('single hash', () => {
    it('should parse sha512 hash', () => {
      const hash = 'sha512-abc123=='

      const parsed = parseIntegrity(hash)

      expect(parsed).toHaveLength(1)
      expect(parsed[0]).toEqual({ algorithm: 'sha512', digest: 'abc123==' })
    })

    it('should parse sha256 hash', () => {
      const hash = 'sha256-xyz789'

      const parsed = parseIntegrity(hash)

      expect(parsed).toHaveLength(1)
      expect(parsed[0]).toEqual({ algorithm: 'sha256', digest: 'xyz789' })
    })

    it('should parse sha1 hash', () => {
      const hash = 'sha1-def456'

      const parsed = parseIntegrity(hash)

      expect(parsed).toHaveLength(1)
      expect(parsed[0]).toEqual({ algorithm: 'sha1', digest: 'def456' })
    })
  })

  describe('multiple hashes', () => {
    it('should parse multiple hashes separated by space', () => {
      const hash = 'sha512-abc sha256-xyz sha1-def'

      const parsed = parseIntegrity(hash)

      expect(parsed).toHaveLength(3)
      expect(parsed[0]?.algorithm).toBe('sha512')
      expect(parsed[1]?.algorithm).toBe('sha256')
      expect(parsed[2]?.algorithm).toBe('sha1')
    })

    it('should handle multiple spaces between hashes', () => {
      const hash = 'sha512-abc   sha256-xyz'

      const parsed = parseIntegrity(hash)

      expect(parsed).toHaveLength(2)
    })
  })

  describe('invalid formats', () => {
    it('should skip invalid algorithm names', () => {
      const hash = 'md5-invalid sha512-valid'

      const parsed = parseIntegrity(hash)

      expect(parsed).toHaveLength(1)
      expect(parsed[0]?.algorithm).toBe('sha512')
    })

    it('should skip malformed entries', () => {
      const hash = 'notvalid sha512-valid also-bad'

      const parsed = parseIntegrity(hash)

      expect(parsed).toHaveLength(1)
      expect(parsed[0]?.algorithm).toBe('sha512')
    })

    it('should return empty array for invalid input', () => {
      const hash = 'completely invalid input'

      const parsed = parseIntegrity(hash)

      expect(parsed).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle whitespace trimming', () => {
      const hash = '  sha512-abc  '

      const parsed = parseIntegrity(hash)

      expect(parsed).toHaveLength(1)
    })

    it('should handle empty string', () => {
      const parsed = parseIntegrity('')

      expect(parsed).toHaveLength(0)
    })
  })
})

// ============================================================================
// 4. createMultipleIntegrity
// ============================================================================
describe('createMultipleIntegrity', () => {
  it('should create hash with multiple algorithms', async () => {
    const data = textEncoder.encode('test')

    const hash = await createMultipleIntegrity(data, ['sha512', 'sha256'])

    expect(hash).toContain('sha512-')
    expect(hash).toContain('sha256-')
  })

  it('should separate hashes with space', async () => {
    const data = textEncoder.encode('test')

    const hash = await createMultipleIntegrity(data, ['sha512', 'sha256'])

    expect(hash.split(' ')).toHaveLength(2)
  })

  it('should create all three algorithm hashes', async () => {
    const data = textEncoder.encode('test')

    const hash = await createMultipleIntegrity(data, ['sha512', 'sha256', 'sha1'])

    expect(hash).toContain('sha512-')
    expect(hash).toContain('sha256-')
    expect(hash).toContain('sha1-')
  })

  it('should handle single algorithm', async () => {
    const data = textEncoder.encode('test')

    const hash = await createMultipleIntegrity(data, ['sha512'])

    const singleHash = await calculateIntegrity(data, 'sha512')
    expect(hash).toBe(singleHash)
  })

  it('should produce verifiable hashes', async () => {
    const data = textEncoder.encode('test')

    const hash = await createMultipleIntegrity(data, ['sha512', 'sha256'])
    const valid = await verifyIntegrity(data, hash)

    expect(valid).toBe(true)
  })
})

// ============================================================================
// 5. getStrongestHash
// ============================================================================
describe('getStrongestHash', () => {
  it('should prefer sha512 over sha256', async () => {
    const data = textEncoder.encode('test')
    const hash512 = await calculateIntegrity(data, 'sha512')
    const hash256 = await calculateIntegrity(data, 'sha256')
    const multiHash = `${hash256} ${hash512}`

    const strongest = getStrongestHash(multiHash)

    expect(strongest).toBe(hash512)
  })

  it('should prefer sha256 over sha1', async () => {
    const data = textEncoder.encode('test')
    const hash256 = await calculateIntegrity(data, 'sha256')
    const hash1 = await calculateIntegrity(data, 'sha1')
    const multiHash = `${hash1} ${hash256}`

    const strongest = getStrongestHash(multiHash)

    expect(strongest).toBe(hash256)
  })

  it('should prefer sha512 over sha1', async () => {
    const data = textEncoder.encode('test')
    const hash512 = await calculateIntegrity(data, 'sha512')
    const hash1 = await calculateIntegrity(data, 'sha1')
    const multiHash = `${hash1} ${hash512}`

    const strongest = getStrongestHash(multiHash)

    expect(strongest).toBe(hash512)
  })

  it('should return single hash unchanged', async () => {
    const data = textEncoder.encode('test')
    const hash = await calculateIntegrity(data, 'sha256')

    const strongest = getStrongestHash(hash)

    expect(strongest).toBe(hash)
  })

  it('should return first valid hash if no preferred algorithm found', () => {
    // This is a hypothetical case since we only support sha512/256/1
    const hash = 'sha1-abc'

    const strongest = getStrongestHash(hash)

    expect(strongest).toBe('sha1-abc')
  })

  it('should return input if no valid hashes', () => {
    const hash = 'invalid-format'

    const strongest = getStrongestHash(hash)

    expect(strongest).toBe(hash)
  })
})

// ============================================================================
// 6. integrityEquals
// ============================================================================
describe('integrityEquals', () => {
  describe('matching hashes', () => {
    it('should return true for identical hashes', async () => {
      const data = textEncoder.encode('test')
      const hash = await calculateIntegrity(data, 'sha512')

      const equal = integrityEquals(hash, hash)

      expect(equal).toBe(true)
    })

    it('should return true when same algorithm and digest match', async () => {
      const data = textEncoder.encode('test')
      const hash1 = await calculateIntegrity(data, 'sha512')
      const hash2 = await calculateIntegrity(data, 'sha512')

      const equal = integrityEquals(hash1, hash2)

      expect(equal).toBe(true)
    })

    it('should return true when any hash matches', async () => {
      const data = textEncoder.encode('test')
      const hash512 = await calculateIntegrity(data, 'sha512')
      const hash256 = await calculateIntegrity(data, 'sha256')
      const multi1 = `${hash512} sha256-different`
      const multi2 = `sha512-different ${hash512}`

      const equal = integrityEquals(multi1, multi2)

      expect(equal).toBe(true)
    })
  })

  describe('non-matching hashes', () => {
    it('should return false for different hashes', async () => {
      const data1 = textEncoder.encode('hello')
      const data2 = textEncoder.encode('world')
      const hash1 = await calculateIntegrity(data1, 'sha512')
      const hash2 = await calculateIntegrity(data2, 'sha512')

      const equal = integrityEquals(hash1, hash2)

      expect(equal).toBe(false)
    })

    it('should return false when algorithms differ with different content', () => {
      const hash1 = 'sha512-abc'
      const hash2 = 'sha256-xyz'

      const equal = integrityEquals(hash1, hash2)

      expect(equal).toBe(false)
    })

    it('should return false when no hashes match in multi-hash', () => {
      const multi1 = 'sha512-abc sha256-def'
      const multi2 = 'sha512-xyz sha256-uvw'

      const equal = integrityEquals(multi1, multi2)

      expect(equal).toBe(false)
    })
  })

  describe('cross-algorithm comparison', () => {
    it('should return false when same content but different algorithms', async () => {
      const data = textEncoder.encode('test')
      const hash512 = await calculateIntegrity(data, 'sha512')
      const hash256 = await calculateIntegrity(data, 'sha256')

      // Different algorithms can't be equal even for same content
      const equal = integrityEquals(hash512, hash256)

      expect(equal).toBe(false)
    })

    it('should return true when multi-hash has matching algorithm', async () => {
      const data = textEncoder.encode('test')
      const hash512 = await calculateIntegrity(data, 'sha512')
      const hash256 = await calculateIntegrity(data, 'sha256')
      const multi = `${hash512} ${hash256}`

      // Compare multi against single - should match on sha512
      const equal = integrityEquals(multi, hash512)

      expect(equal).toBe(true)
    })
  })
})

// ============================================================================
// 7. IntegrityStream
// ============================================================================
describe('IntegrityStream', () => {
  describe('basic usage', () => {
    it('should calculate integrity for streamed data', async () => {
      const stream = new IntegrityStream('sha512')
      stream.update(textEncoder.encode('hello'))
      stream.update(textEncoder.encode(' world'))

      const hash = await stream.digest()

      // Compare with single-shot calculation
      const expected = await calculateIntegrity(textEncoder.encode('hello world'), 'sha512')
      expect(hash).toBe(expected)
    })

    it('should use sha512 by default', async () => {
      const stream = new IntegrityStream()
      stream.update(textEncoder.encode('test'))

      const hash = await stream.digest()

      expect(hash).toMatch(/^sha512-/)
    })

    it('should support sha256', async () => {
      const stream = new IntegrityStream('sha256')
      stream.update(textEncoder.encode('test'))

      const hash = await stream.digest()

      expect(hash).toMatch(/^sha256-/)
    })

    it('should support sha1', async () => {
      const stream = new IntegrityStream('sha1')
      stream.update(textEncoder.encode('test'))

      const hash = await stream.digest()

      expect(hash).toMatch(/^sha1-/)
    })
  })

  describe('chunk handling', () => {
    it('should handle multiple small chunks', async () => {
      const stream = new IntegrityStream('sha512')
      const message = 'hello world test data'

      // Add one character at a time
      for (const char of message) {
        stream.update(textEncoder.encode(char))
      }

      const hash = await stream.digest()
      const expected = await calculateIntegrity(textEncoder.encode(message), 'sha512')

      expect(hash).toBe(expected)
    })

    it('should handle large chunks', async () => {
      const stream = new IntegrityStream('sha512')
      const largeData = new Uint8Array(1024 * 100) // 100KB

      stream.update(largeData)

      const hash = await stream.digest()
      const expected = await calculateIntegrity(largeData, 'sha512')

      expect(hash).toBe(expected)
    })

    it('should handle mixed chunk sizes', async () => {
      const stream = new IntegrityStream('sha512')
      const data1 = new Uint8Array(1000)
      const data2 = new Uint8Array(50)
      const data3 = new Uint8Array(5000)

      stream.update(data1)
      stream.update(data2)
      stream.update(data3)

      const hash = await stream.digest()

      // Combine manually and compare
      const combined = new Uint8Array(6050)
      combined.set(data1, 0)
      combined.set(data2, 1000)
      combined.set(data3, 1050)
      const expected = await calculateIntegrity(combined, 'sha512')

      expect(hash).toBe(expected)
    })
  })

  describe('reset', () => {
    it('should allow reuse after reset', async () => {
      const stream = new IntegrityStream('sha512')

      stream.update(textEncoder.encode('first'))
      await stream.digest()

      stream.reset()
      stream.update(textEncoder.encode('second'))
      const hash = await stream.digest()

      const expected = await calculateIntegrity(textEncoder.encode('second'), 'sha512')
      expect(hash).toBe(expected)
    })

    it('should clear previous data on reset', async () => {
      const stream = new IntegrityStream('sha512')
      stream.update(textEncoder.encode('initial data'))

      stream.reset()

      const hash = await stream.digest()
      const emptyHash = await calculateIntegrity(new Uint8Array(0), 'sha512')

      expect(hash).toBe(emptyHash)
    })
  })

  describe('edge cases', () => {
    it('should handle empty stream', async () => {
      const stream = new IntegrityStream('sha512')

      const hash = await stream.digest()
      const expected = await calculateIntegrity(new Uint8Array(0), 'sha512')

      expect(hash).toBe(expected)
    })

    it('should handle single byte update', async () => {
      const stream = new IntegrityStream('sha512')
      stream.update(new Uint8Array([42]))

      const hash = await stream.digest()
      const expected = await calculateIntegrity(new Uint8Array([42]), 'sha512')

      expect(hash).toBe(expected)
    })
  })
})

// ============================================================================
// 8. base64ToArrayBuffer
// ============================================================================
describe('base64ToArrayBuffer', () => {
  it('should convert base64 to ArrayBuffer', () => {
    // "hello" in base64 is "aGVsbG8="
    const base64 = 'aGVsbG8='

    const buffer = base64ToArrayBuffer(base64)

    const bytes = new Uint8Array(buffer)
    const text = new TextDecoder().decode(bytes)
    expect(text).toBe('hello')
  })

  it('should handle empty string', () => {
    const buffer = base64ToArrayBuffer('')

    expect(buffer.byteLength).toBe(0)
  })

  it('should handle binary data', () => {
    // Binary data [0, 1, 2, 255] encoded
    const base64 = 'AAEC/w=='

    const buffer = base64ToArrayBuffer(base64)

    const bytes = new Uint8Array(buffer)
    expect(bytes[0]).toBe(0)
    expect(bytes[1]).toBe(1)
    expect(bytes[2]).toBe(2)
    expect(bytes[3]).toBe(255)
  })
})

// ============================================================================
// Integration tests
// ============================================================================
describe('Integrity Integration', () => {
  it('should work end-to-end: calculate, parse, verify', async () => {
    const data = textEncoder.encode('package content')

    // Calculate
    const hash = await calculateIntegrity(data, 'sha512')

    // Parse
    const parsed = parseIntegrity(hash)
    expect(parsed).toHaveLength(1)
    expect(parsed[0]?.algorithm).toBe('sha512')

    // Verify
    const valid = await verifyIntegrity(data, hash)
    expect(valid).toBe(true)
  })

  it('should work with streaming calculation', async () => {
    const chunks = [
      textEncoder.encode('chunk1'),
      textEncoder.encode('chunk2'),
      textEncoder.encode('chunk3'),
    ]

    // Stream calculation
    const stream = new IntegrityStream('sha512')
    for (const chunk of chunks) {
      stream.update(chunk)
    }
    const streamHash = await stream.digest()

    // Combine and calculate normally
    const combined = new Uint8Array(
      chunks.reduce((sum, c) => sum + c.length, 0)
    )
    let offset = 0
    for (const chunk of chunks) {
      combined.set(chunk, offset)
      offset += chunk.length
    }
    const normalHash = await calculateIntegrity(combined, 'sha512')

    expect(streamHash).toBe(normalHash)

    // Verify both
    expect(await verifyIntegrity(combined, streamHash)).toBe(true)
    expect(await verifyIntegrity(combined, normalHash)).toBe(true)
  })

  it('should handle npm-like workflow', async () => {
    // Simulate npm tarball integrity workflow
    const tarballContent = textEncoder.encode('fake tarball content')

    // Create multiple integrity hashes (npm stores both sha512 and sha1)
    const multiHash = await createMultipleIntegrity(tarballContent, ['sha512', 'sha1'])

    // Get strongest for display
    const displayed = getStrongestHash(multiHash)
    expect(displayed).toMatch(/^sha512-/)

    // Verify downloaded content
    const valid = await verifyIntegrity(tarballContent, multiHash)
    expect(valid).toBe(true)

    // Compare two packages with same content
    const otherTarball = await calculateIntegrity(tarballContent, 'sha512')
    const areEqual = integrityEquals(multiHash, otherTarball)
    expect(areEqual).toBe(true)
  })
})
