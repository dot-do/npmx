/**
 * Dependency Tree Resolver
 *
 * npm-compatible dependency resolution with:
 * - Flat dependency resolution
 * - Version conflict resolution
 * - Peer dependency handling
 * - Optional dependency handling
 * - Circular dependency detection
 * - Hoisting and deduplication
 * - Lock file generation
 * - Tree diffing
 *
 * This module has ZERO Cloudflare dependencies.
 */
// Tree builder
export { DependencyTreeBuilder, detectCircularDependencies } from './tree';
// Hoisting
export { analyzeHoisting, applyHoisting, calculateDeduplicationSavings, } from './hoisting';
// Lockfile
export { generateLockFile, parseLockFile, diffTrees, validateLockFile, } from './lockfile';
/**
 * Resolve a package name and version range to a specific version.
 * @deprecated Use DependencyTreeBuilder.resolve() instead
 */
export function resolve(_name, _range, _options) {
    throw new Error('Deprecated: Use DependencyTreeBuilder.resolve() instead');
}
/**
 * Fetch package metadata from the registry.
 * @deprecated Use RegistryFetcher interface instead
 */
export function fetchPackageMetadata(_name, _options) {
    throw new Error('Deprecated: Use RegistryFetcher interface instead');
}
/**
 * Resolve all dependencies for a package recursively.
 * @deprecated Use DependencyTreeBuilder.resolve() instead
 */
export function resolveDependencyTree(_name, _range, _options) {
    throw new Error('Deprecated: Use DependencyTreeBuilder.resolve() instead');
}
//# sourceMappingURL=index.js.map