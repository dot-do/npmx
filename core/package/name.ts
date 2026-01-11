/**
 * Package Name Encoding for Registry URLs
 *
 * Scoped package names like @types/node contain a `/` character that must be
 * URL-encoded when used in registry URLs. This module provides utilities for
 * encoding package names and validating them for registry operations.
 *
 * @example
 * ```typescript
 * import { encodePackageName } from './name'
 *
 * // For scoped packages, encodes the slash
 * encodePackageName('@types/node')  // => '@types%2Fnode'
 *
 * // For unscoped packages, returns as-is
 * encodePackageName('lodash')       // => 'lodash'
 * ```
 *
 * @see https://docs.npmjs.com/cli/v10/using-npm/scope
 * @see https://github.com/npm/npm-package-arg
 *
 * This module has ZERO Cloudflare dependencies.
 */

/**
 * Result type for package name validation
 */
export interface PackageNameValidation {
  valid: boolean
  scoped: boolean
  scope?: string
  name?: string
  error?: 'EMPTY_INPUT' | 'EMPTY_SCOPE' | 'EMPTY_NAME' | 'MISSING_SLASH' | 'INVALID_SCOPE_PREFIX' | 'MULTIPLE_SLASHES'
}

/**
 * Validates a package name for registry operations and extracts scope/name parts.
 *
 * @param packageName - The package name to validate
 * @returns Validation result with parsed scope/name if valid
 *
 * @example
 * ```typescript
 * validatePackageNameForRegistry('@types/node')
 * // => { valid: true, scoped: true, scope: 'types', name: 'node' }
 *
 * validatePackageNameForRegistry('lodash')
 * // => { valid: true, scoped: false }
 *
 * validatePackageNameForRegistry('@/package')
 * // => { valid: false, error: 'EMPTY_SCOPE' }
 * ```
 */
export function validatePackageNameForRegistry(packageName: string): PackageNameValidation {
  // Check for empty input
  if (!packageName || packageName.trim() === '') {
    return { valid: false, scoped: false, error: 'EMPTY_INPUT' }
  }

  // Unscoped packages
  if (!packageName.startsWith('@')) {
    return { valid: true, scoped: false }
  }

  // Check for invalid prefix (@@)
  if (packageName.startsWith('@@')) {
    return { valid: false, scoped: false, error: 'INVALID_SCOPE_PREFIX' }
  }

  // Scoped packages - must have exactly one slash
  const slashIndex = packageName.indexOf('/')

  // No slash found - scope only
  if (slashIndex === -1) {
    return { valid: false, scoped: false, error: 'MISSING_SLASH' }
  }

  // Check for multiple slashes
  const secondSlashIndex = packageName.indexOf('/', slashIndex + 1)
  if (secondSlashIndex !== -1) {
    return { valid: false, scoped: false, error: 'MULTIPLE_SLASHES' }
  }

  // Extract scope and name
  const scope = packageName.slice(1, slashIndex)
  const name = packageName.slice(slashIndex + 1)

  // Validate scope is not empty
  if (!scope) {
    return { valid: false, scoped: false, error: 'EMPTY_SCOPE' }
  }

  // Validate name is not empty
  if (!name) {
    return { valid: false, scoped: false, error: 'EMPTY_NAME' }
  }

  return { valid: true, scoped: true, scope, name }
}

/**
 * Encodes a package name for use in npm registry URLs.
 *
 * For scoped packages (e.g., @types/node), the `/` character must be
 * URL-encoded as `%2F` to be used correctly in registry URL paths.
 *
 * @param packageName - The package name to encode
 * @returns URL-encoded package name suitable for registry URLs
 * @throws Error if the package name is invalid
 *
 * @example
 * ```typescript
 * // Scoped packages - encodes the slash
 * encodePackageName('@types/node')
 * // => '@types%2Fnode'
 *
 * encodePackageName('@babel/core')
 * // => '@babel%2Fcore'
 *
 * // Unscoped packages - unchanged
 * encodePackageName('lodash')
 * // => 'lodash'
 *
 * // Use in registry URLs
 * const encoded = encodePackageName('@types/node')
 * fetch(`https://registry.npmjs.org/${encoded}/latest`)
 * // => https://registry.npmjs.org/@types%2Fnode/latest
 * ```
 */
export function encodePackageName(packageName: string): string {
  // Check for empty input
  if (!packageName || packageName.trim() === '') {
    throw new Error('Package name cannot be empty')
  }

  // Unscoped packages - return as-is (no encoding needed)
  if (!packageName.startsWith('@')) {
    return packageName
  }

  // Validate the scoped package name
  const validation = validatePackageNameForRegistry(packageName)

  if (!validation.valid) {
    throw new Error(`Invalid scoped package name: ${packageName}`)
  }

  // Encode the slash between scope and package name
  // @scope/package => @scope%2Fpackage
  const { scope, name } = validation
  return `@${scope}%2F${name}`
}
