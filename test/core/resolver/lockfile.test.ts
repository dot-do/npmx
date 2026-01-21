/**
 * Lock File Tests
 *
 * Tests for npm v3 compatible package-lock.json generation and parsing.
 * Covers generateLockFile, parseLockFile, diffTrees, and validateLockFile.
 */

import { describe, it, expect } from 'vitest'
import {
  generateLockFile,
  parseLockFile,
  diffTrees,
  validateLockFile,
  type LockFileValidation,
} from '../../../core/resolver/lockfile'
import type {
  DependencyTree,
  DependencyNode,
  LockFile,
  LockFileEntry,
  TreeDiff,
} from '../../../core/resolver/types'

// Helper to create a DependencyNode
function createNode(
  name: string,
  version: string,
  deps: Record<string, string> = {},
  opts: Partial<DependencyNode> = {}
): DependencyNode {
  return {
    name,
    version,
    dependencies: deps,
    dev: false,
    ...opts,
  }
}

// Helper to create a DependencyTree
function createTree(
  resolved: Record<string, DependencyNode>,
  opts: Partial<DependencyTree> = {}
): DependencyTree {
  return {
    name: 'test-package',
    version: '1.0.0',
    resolved,
    warnings: [],
    stats: {
      totalPackages: Object.keys(resolved).length,
      deduplicatedPackages: 0,
      registryFetches: 0,
    },
    ...opts,
  }
}

// ============================================================================
// 1. generateLockFile
// ============================================================================
describe('generateLockFile', () => {
  describe('basic structure', () => {
    it('should generate lockfile with version 3', () => {
      const tree = createTree({
        lodash: createNode('lodash', '4.17.21'),
      })

      const lockfile = generateLockFile(tree)

      expect(lockfile.lockfileVersion).toBe(3)
    })

    it('should include package name and version', () => {
      const tree = createTree(
        { pkg: createNode('pkg', '1.0.0') },
        { name: 'my-app', version: '2.0.0' }
      )

      const lockfile = generateLockFile(tree)

      expect(lockfile.name).toBe('my-app')
      expect(lockfile.version).toBe('2.0.0')
    })

    it('should have requires set to true', () => {
      const tree = createTree({})

      const lockfile = generateLockFile(tree)

      expect(lockfile.requires).toBe(true)
    })

    it('should have packages object', () => {
      const tree = createTree({})

      const lockfile = generateLockFile(tree)

      expect(lockfile.packages).toBeDefined()
      expect(typeof lockfile.packages).toBe('object')
    })
  })

  describe('root package entry', () => {
    it('should have empty string key for root package', () => {
      const tree = createTree({
        dep: createNode('dep', '1.0.0'),
      })

      const lockfile = generateLockFile(tree)

      expect(lockfile.packages['']).toBeDefined()
    })

    it('should include root version in root entry', () => {
      const tree = createTree({}, { version: '3.0.0' })

      const lockfile = generateLockFile(tree)

      expect(lockfile.packages[''].version).toBe('3.0.0')
    })

    it('should collect root dependencies in root entry', () => {
      const tree = createTree({
        lodash: createNode('lodash', '4.17.21'),
        express: createNode('express', '4.18.2'),
      })

      const lockfile = generateLockFile(tree)

      expect(lockfile.packages[''].dependencies).toHaveProperty('lodash')
      expect(lockfile.packages[''].dependencies).toHaveProperty('express')
    })
  })

  describe('resolved packages', () => {
    it('should add packages with node_modules/ prefix', () => {
      const tree = createTree({
        lodash: createNode('lodash', '4.17.21'),
      })

      const lockfile = generateLockFile(tree)

      expect(lockfile.packages['node_modules/lodash']).toBeDefined()
    })

    it('should include package version', () => {
      const tree = createTree({
        lodash: createNode('lodash', '4.17.21'),
      })

      const lockfile = generateLockFile(tree)

      expect(lockfile.packages['node_modules/lodash'].version).toBe('4.17.21')
    })

    it('should include resolved URL when present', () => {
      const tree = createTree({
        lodash: createNode('lodash', '4.17.21', {}, {
          resolved: 'https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz',
        }),
      })

      const lockfile = generateLockFile(tree)

      expect(lockfile.packages['node_modules/lodash'].resolved).toBe(
        'https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz'
      )
    })

    it('should include integrity hash when present', () => {
      const tree = createTree({
        lodash: createNode('lodash', '4.17.21', {}, {
          integrity: 'sha512-abc123==',
        }),
      })

      const lockfile = generateLockFile(tree)

      expect(lockfile.packages['node_modules/lodash'].integrity).toBe('sha512-abc123==')
    })

    it('should mark dev dependencies', () => {
      const tree = createTree({
        vitest: createNode('vitest', '1.0.0', {}, { dev: true }),
      })

      const lockfile = generateLockFile(tree)

      expect(lockfile.packages['node_modules/vitest'].dev).toBe(true)
    })

    it('should mark optional dependencies', () => {
      const tree = createTree({
        fsevents: createNode('fsevents', '2.3.3', {}, { optional: true }),
      })

      const lockfile = generateLockFile(tree)

      expect(lockfile.packages['node_modules/fsevents'].optional).toBe(true)
    })

    it('should include package dependencies', () => {
      const tree = createTree({
        express: createNode('express', '4.18.2', {
          'body-parser': '^1.20.0',
          cookie: '^0.5.0',
        }),
      })

      const lockfile = generateLockFile(tree)

      expect(lockfile.packages['node_modules/express'].dependencies).toEqual({
        'body-parser': '^1.20.0',
        cookie: '^0.5.0',
      })
    })

    it('should include peer dependencies', () => {
      const tree = createTree({
        'react-dom': createNode('react-dom', '18.2.0', {}, {
          peerDependencies: { react: '^18.0.0' },
        }),
      })

      const lockfile = generateLockFile(tree)

      expect(lockfile.packages['node_modules/react-dom'].peerDependencies).toEqual({
        react: '^18.0.0',
      })
    })

    it('should include bundled dependencies', () => {
      const tree = createTree({
        'with-bundled': createNode('with-bundled', '1.0.0', {}, {
          bundledDependencies: ['lodash', 'underscore'],
        }),
      })

      const lockfile = generateLockFile(tree)

      expect(lockfile.packages['node_modules/with-bundled'].bundleDependencies).toEqual([
        'lodash',
        'underscore',
      ])
    })
  })

  describe('nested dependencies', () => {
    it('should add nested packages with proper path', () => {
      const tree = createTree({
        parent: createNode('parent', '1.0.0', {}, {
          nestedDependencies: {
            nested: createNode('nested', '2.0.0'),
          },
        }),
      })

      const lockfile = generateLockFile(tree)

      expect(lockfile.packages['node_modules/parent/node_modules/nested']).toBeDefined()
    })

    it('should handle deeply nested dependencies', () => {
      const tree = createTree({
        a: createNode('a', '1.0.0', {}, {
          nestedDependencies: {
            b: createNode('b', '1.0.0', {}, {
              nestedDependencies: {
                c: createNode('c', '1.0.0'),
              },
            }),
          },
        }),
      })

      const lockfile = generateLockFile(tree)

      expect(lockfile.packages['node_modules/a/node_modules/b/node_modules/c']).toBeDefined()
    })
  })

  describe('edge cases', () => {
    it('should handle empty tree', () => {
      const tree = createTree({})

      const lockfile = generateLockFile(tree)

      expect(lockfile.packages['']).toBeDefined()
      expect(Object.keys(lockfile.packages)).toHaveLength(1)
    })

    it('should handle missing name/version with defaults', () => {
      const tree: DependencyTree = {
        resolved: {},
        warnings: [],
        stats: { totalPackages: 0, deduplicatedPackages: 0, registryFetches: 0 },
      }

      const lockfile = generateLockFile(tree)

      expect(lockfile.name).toBe('package')
      expect(lockfile.version).toBe('0.0.0')
    })

    it('should produce valid JSON', () => {
      const tree = createTree({
        lodash: createNode('lodash', '4.17.21', {
          dep: '^1.0.0',
        }, {
          integrity: 'sha512-xyz',
          resolved: 'https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz',
        }),
      })

      const lockfile = generateLockFile(tree)
      const json = JSON.stringify(lockfile)

      expect(() => JSON.parse(json)).not.toThrow()
    })
  })
})

// ============================================================================
// 2. parseLockFile
// ============================================================================
describe('parseLockFile', () => {
  describe('basic parsing', () => {
    it('should parse lockfile into DependencyTree', () => {
      const lockfile: LockFile = {
        name: 'my-app',
        version: '1.0.0',
        lockfileVersion: 3,
        requires: true,
        packages: {
          '': { version: '1.0.0', dependencies: { lodash: '4.17.21' } },
          'node_modules/lodash': { version: '4.17.21' },
        },
      }

      const tree = parseLockFile(lockfile)

      expect(tree.name).toBe('my-app')
      expect(tree.version).toBe('1.0.0')
      expect(tree.resolved).toHaveProperty('lodash')
    })

    it('should skip root entry when parsing', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/pkg': { version: '1.0.0' },
        },
      }

      const tree = parseLockFile(lockfile)

      // Should have one package, not two (root is skipped)
      expect(Object.keys(tree.resolved)).toHaveLength(1)
      expect(tree.resolved.pkg).toBeDefined()
    })

    it('should extract package name from path', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/lodash': { version: '4.17.21' },
          'node_modules/express': { version: '4.18.2' },
        },
      }

      const tree = parseLockFile(lockfile)

      expect(tree.resolved).toHaveProperty('lodash')
      expect(tree.resolved).toHaveProperty('express')
    })
  })

  describe('entry conversion', () => {
    it('should convert version', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/pkg': { version: '2.3.4' },
        },
      }

      const tree = parseLockFile(lockfile)

      expect(tree.resolved.pkg.version).toBe('2.3.4')
    })

    it('should convert dependencies', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/pkg': {
            version: '1.0.0',
            dependencies: { dep: '^1.0.0' },
          },
        },
      }

      const tree = parseLockFile(lockfile)

      expect(tree.resolved.pkg.dependencies).toEqual({ dep: '^1.0.0' })
    })

    it('should convert optional flag', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/optional-pkg': { version: '1.0.0', optional: true },
        },
      }

      const tree = parseLockFile(lockfile)

      expect(tree.resolved['optional-pkg'].optional).toBe(true)
    })

    it('should convert dev flag', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/dev-pkg': { version: '1.0.0', dev: true },
        },
      }

      const tree = parseLockFile(lockfile)

      expect(tree.resolved['dev-pkg'].dev).toBe(true)
    })

    it('should convert peerDependencies', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/react-dom': {
            version: '18.2.0',
            peerDependencies: { react: '^18.0.0' },
          },
        },
      }

      const tree = parseLockFile(lockfile)

      expect(tree.resolved['react-dom'].peerDependencies).toEqual({ react: '^18.0.0' })
    })

    it('should convert bundleDependencies', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/bundled-pkg': {
            version: '1.0.0',
            bundleDependencies: ['dep-a', 'dep-b'],
          },
        },
      }

      const tree = parseLockFile(lockfile)

      expect(tree.resolved['bundled-pkg'].bundledDependencies).toEqual(['dep-a', 'dep-b'])
      expect(tree.resolved['bundled-pkg'].hasBundled).toBe(true)
    })

    it('should convert integrity', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/pkg': {
            version: '1.0.0',
            integrity: 'sha512-abc123==',
          },
        },
      }

      const tree = parseLockFile(lockfile)

      expect(tree.resolved.pkg.integrity).toBe('sha512-abc123==')
    })

    it('should convert resolved URL', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/pkg': {
            version: '1.0.0',
            resolved: 'https://registry.npmjs.org/pkg/-/pkg-1.0.0.tgz',
          },
        },
      }

      const tree = parseLockFile(lockfile)

      expect(tree.resolved.pkg.resolved).toBe('https://registry.npmjs.org/pkg/-/pkg-1.0.0.tgz')
    })
  })

  describe('nested packages', () => {
    it('should parse nested packages', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/parent': { version: '1.0.0' },
          'node_modules/parent/node_modules/nested': { version: '2.0.0' },
        },
      }

      const tree = parseLockFile(lockfile)

      expect(tree.resolved.parent.nestedDependencies).toBeDefined()
      expect(tree.resolved.parent.nestedDependencies?.nested).toBeDefined()
      expect(tree.resolved.parent.nestedDependencies?.nested.version).toBe('2.0.0')
    })
  })

  describe('stats', () => {
    it('should calculate total packages', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/a': { version: '1.0.0' },
          'node_modules/b': { version: '1.0.0' },
          'node_modules/c': { version: '1.0.0' },
        },
      }

      const tree = parseLockFile(lockfile)

      expect(tree.stats.totalPackages).toBe(3)
    })

    it('should initialize warnings as empty array', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: { '': { version: '1.0.0' } },
      }

      const tree = parseLockFile(lockfile)

      expect(tree.warnings).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('should handle missing name/version', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: { '': { version: '1.0.0' } },
      }

      const tree = parseLockFile(lockfile)

      expect(tree.name).toBe('package')
      expect(tree.version).toBe('0.0.0')
    })

    it('should handle empty packages object', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: { '': { version: '1.0.0' } },
      }

      const tree = parseLockFile(lockfile)

      expect(Object.keys(tree.resolved)).toHaveLength(0)
    })
  })
})

// ============================================================================
// 3. diffTrees
// ============================================================================
describe('diffTrees', () => {
  describe('added packages', () => {
    it('should detect added packages', () => {
      const before = createTree({
        a: createNode('a', '1.0.0'),
      })

      const after = createTree({
        a: createNode('a', '1.0.0'),
        b: createNode('b', '2.0.0'),
      })

      const diff = diffTrees(before, after)

      expect(diff.added).toContainEqual({ name: 'b', version: '2.0.0' })
    })

    it('should detect multiple added packages', () => {
      const before = createTree({})

      const after = createTree({
        a: createNode('a', '1.0.0'),
        b: createNode('b', '2.0.0'),
        c: createNode('c', '3.0.0'),
      })

      const diff = diffTrees(before, after)

      expect(diff.added).toHaveLength(3)
    })
  })

  describe('removed packages', () => {
    it('should detect removed packages', () => {
      const before = createTree({
        a: createNode('a', '1.0.0'),
        b: createNode('b', '2.0.0'),
      })

      const after = createTree({
        a: createNode('a', '1.0.0'),
      })

      const diff = diffTrees(before, after)

      expect(diff.removed).toContainEqual({ name: 'b', version: '2.0.0' })
    })

    it('should detect multiple removed packages', () => {
      const before = createTree({
        a: createNode('a', '1.0.0'),
        b: createNode('b', '2.0.0'),
        c: createNode('c', '3.0.0'),
      })

      const after = createTree({})

      const diff = diffTrees(before, after)

      expect(diff.removed).toHaveLength(3)
    })
  })

  describe('updated packages', () => {
    it('should detect updated packages', () => {
      const before = createTree({
        pkg: createNode('pkg', '1.0.0'),
      })

      const after = createTree({
        pkg: createNode('pkg', '2.0.0'),
      })

      const diff = diffTrees(before, after)

      expect(diff.updated).toContainEqual({
        name: 'pkg',
        from: '1.0.0',
        to: '2.0.0',
      })
    })

    it('should detect downgrade as update', () => {
      const before = createTree({
        pkg: createNode('pkg', '2.0.0'),
      })

      const after = createTree({
        pkg: createNode('pkg', '1.0.0'),
      })

      const diff = diffTrees(before, after)

      expect(diff.updated).toContainEqual({
        name: 'pkg',
        from: '2.0.0',
        to: '1.0.0',
      })
    })
  })

  describe('unchanged packages', () => {
    it('should detect unchanged packages', () => {
      const before = createTree({
        pkg: createNode('pkg', '1.0.0'),
      })

      const after = createTree({
        pkg: createNode('pkg', '1.0.0'),
      })

      const diff = diffTrees(before, after)

      expect(diff.unchanged).toContainEqual({ name: 'pkg', version: '1.0.0' })
    })

    it('should not include updated packages in unchanged', () => {
      const before = createTree({
        pkg: createNode('pkg', '1.0.0'),
      })

      const after = createTree({
        pkg: createNode('pkg', '2.0.0'),
      })

      const diff = diffTrees(before, after)

      expect(diff.unchanged).toHaveLength(0)
    })
  })

  describe('summary', () => {
    it('should provide correct summary counts', () => {
      const before = createTree({
        unchanged: createNode('unchanged', '1.0.0'),
        removed: createNode('removed', '1.0.0'),
        updated: createNode('updated', '1.0.0'),
      })

      const after = createTree({
        unchanged: createNode('unchanged', '1.0.0'),
        added: createNode('added', '1.0.0'),
        updated: createNode('updated', '2.0.0'),
      })

      const diff = diffTrees(before, after)

      expect(diff.summary).toEqual({
        added: 1,
        removed: 1,
        updated: 1,
        unchanged: 1,
      })
    })

    it('should have all zeros for identical trees', () => {
      const tree = createTree({
        pkg: createNode('pkg', '1.0.0'),
      })

      const diff = diffTrees(tree, tree)

      expect(diff.summary.added).toBe(0)
      expect(diff.summary.removed).toBe(0)
      expect(diff.summary.updated).toBe(0)
      expect(diff.summary.unchanged).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle empty before tree', () => {
      const before = createTree({})
      const after = createTree({
        pkg: createNode('pkg', '1.0.0'),
      })

      const diff = diffTrees(before, after)

      expect(diff.added).toHaveLength(1)
      expect(diff.removed).toHaveLength(0)
    })

    it('should handle empty after tree', () => {
      const before = createTree({
        pkg: createNode('pkg', '1.0.0'),
      })
      const after = createTree({})

      const diff = diffTrees(before, after)

      expect(diff.added).toHaveLength(0)
      expect(diff.removed).toHaveLength(1)
    })

    it('should handle both empty trees', () => {
      const before = createTree({})
      const after = createTree({})

      const diff = diffTrees(before, after)

      expect(diff.added).toHaveLength(0)
      expect(diff.removed).toHaveLength(0)
      expect(diff.updated).toHaveLength(0)
      expect(diff.unchanged).toHaveLength(0)
    })
  })
})

// ============================================================================
// 4. validateLockFile
// ============================================================================
describe('validateLockFile', () => {
  describe('lockfile version', () => {
    it('should validate version 3 without warnings', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/pkg': {
            version: '1.0.0',
            integrity: 'sha512-abc==',
            resolved: 'https://registry.npmjs.org/pkg/-/pkg-1.0.0.tgz',
          },
        },
      }

      const validation = validateLockFile(lockfile)

      const versionWarning = validation.warnings.find((w) =>
        w.includes('version')
      )
      expect(versionWarning).toBeUndefined()
    })

    it('should warn for non-v3 lockfile versions', () => {
      const lockfile: LockFile = {
        lockfileVersion: 2,
        packages: { '': { version: '1.0.0' } },
      }

      const validation = validateLockFile(lockfile)

      expect(validation.warnings.some((w) => w.includes('version 2'))).toBe(true)
    })
  })

  describe('integrity checks', () => {
    it('should warn for missing integrity hash', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/pkg': { version: '1.0.0' },
        },
      }

      const validation = validateLockFile(lockfile)

      expect(validation.warnings.some((w) => w.includes('integrity'))).toBe(true)
    })

    it('should not warn when integrity hash is present', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/pkg': {
            version: '1.0.0',
            integrity: 'sha512-abc==',
            resolved: 'https://registry.npmjs.org/pkg/-/pkg-1.0.0.tgz',
          },
        },
      }

      const validation = validateLockFile(lockfile)

      const integrityWarning = validation.warnings.find(
        (w) => w.includes('integrity') && w.includes('node_modules/pkg')
      )
      expect(integrityWarning).toBeUndefined()
    })
  })

  describe('resolved URL checks', () => {
    it('should warn for missing resolved URL', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/pkg': { version: '1.0.0' },
        },
      }

      const validation = validateLockFile(lockfile)

      expect(validation.warnings.some((w) => w.includes('resolved'))).toBe(true)
    })

    it('should not warn when resolved URL is present', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/pkg': {
            version: '1.0.0',
            integrity: 'sha512-abc==',
            resolved: 'https://registry.npmjs.org/pkg/-/pkg-1.0.0.tgz',
          },
        },
      }

      const validation = validateLockFile(lockfile)

      const resolvedWarning = validation.warnings.find(
        (w) => w.includes('resolved') && w.includes('node_modules/pkg')
      )
      expect(resolvedWarning).toBeUndefined()
    })
  })

  describe('validation result', () => {
    it('should return valid=true when no errors', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' },
          'node_modules/pkg': {
            version: '1.0.0',
            integrity: 'sha512-abc==',
            resolved: 'https://registry.npmjs.org/pkg/-/pkg-1.0.0.tgz',
          },
        },
      }

      const validation = validateLockFile(lockfile)

      expect(validation.valid).toBe(true)
    })

    it('should return errors array', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: { '': { version: '1.0.0' } },
      }

      const validation = validateLockFile(lockfile)

      expect(validation.errors).toBeDefined()
      expect(Array.isArray(validation.errors)).toBe(true)
    })

    it('should return warnings array', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: { '': { version: '1.0.0' } },
      }

      const validation = validateLockFile(lockfile)

      expect(validation.warnings).toBeDefined()
      expect(Array.isArray(validation.warnings)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should skip root entry validation', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: {
          '': { version: '1.0.0' }, // No integrity/resolved needed for root
        },
      }

      const validation = validateLockFile(lockfile)

      // Should not warn about root entry missing integrity/resolved
      expect(validation.warnings).toHaveLength(0)
    })

    it('should handle empty packages object', () => {
      const lockfile: LockFile = {
        lockfileVersion: 3,
        packages: { '': { version: '1.0.0' } },
      }

      const validation = validateLockFile(lockfile)

      expect(validation.valid).toBe(true)
    })
  })
})

// ============================================================================
// Integration tests
// ============================================================================
describe('Lockfile Integration', () => {
  it('should roundtrip through generate and parse', () => {
    const originalTree = createTree({
      lodash: createNode('lodash', '4.17.21', {}, {
        integrity: 'sha512-abc==',
        resolved: 'https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz',
      }),
      express: createNode('express', '4.18.2', {
        'body-parser': '^1.20.0',
      }, {
        integrity: 'sha512-xyz==',
        resolved: 'https://registry.npmjs.org/express/-/express-4.18.2.tgz',
      }),
    })

    const lockfile = generateLockFile(originalTree)
    const parsedTree = parseLockFile(lockfile)

    expect(parsedTree.resolved.lodash.version).toBe('4.17.21')
    expect(parsedTree.resolved.express.version).toBe('4.18.2')
    expect(parsedTree.resolved.express.dependencies).toHaveProperty('body-parser')
  })

  it('should produce valid lockfile that passes validation', () => {
    const tree = createTree({
      pkg: createNode('pkg', '1.0.0', {}, {
        integrity: 'sha512-valid==',
        resolved: 'https://registry.npmjs.org/pkg/-/pkg-1.0.0.tgz',
      }),
    })

    const lockfile = generateLockFile(tree)
    const validation = validateLockFile(lockfile)

    expect(validation.valid).toBe(true)
  })

  it('should correctly diff generated lockfiles', () => {
    const tree1 = createTree({
      a: createNode('a', '1.0.0'),
    })

    const tree2 = createTree({
      a: createNode('a', '2.0.0'),
      b: createNode('b', '1.0.0'),
    })

    const diff = diffTrees(tree1, tree2)

    expect(diff.added).toContainEqual({ name: 'b', version: '1.0.0' })
    expect(diff.updated).toContainEqual({ name: 'a', from: '1.0.0', to: '2.0.0' })
  })
})
