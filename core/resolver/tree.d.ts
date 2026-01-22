/**
 * Dependency Tree Builder
 *
 * Builds a complete dependency tree with:
 * - Flat dependency resolution
 * - Version conflict resolution (newest compatible)
 * - Peer dependency handling
 * - Optional dependency handling
 * - Circular dependency detection
 * - Hoisting and deduplication
 * - devDependencies separation
 * - bundledDependencies support
 *
 * Performance optimizations:
 * - Parallel resolution of independent dependencies
 * - Batched registry fetches with concurrency control
 * - Reduced object allocations in hot paths
 * - Optimized version satisfaction checks (using cached semver)
 */
import type { DependencyTree, ResolutionOptions, PackageManifest } from './types';
export declare class DependencyTreeBuilder {
    private registry;
    private production;
    private autoInstallPeers;
    private platform;
    constructor(options: ResolutionOptions);
    /**
     * Resolve dependencies and build the dependency tree
     *
     * Performance: Uses parallel resolution for root-level dependencies
     * while maintaining correctness for nested dependencies
     */
    resolve(manifest: PackageManifest): Promise<DependencyTree>;
    /**
     * Prefetch version lists for multiple packages in parallel
     */
    private prefetchVersions;
    /**
     * Resolve a single package and its dependencies
     */
    private resolvePackage;
    /**
     * Resolve a version range to a specific version
     *
     * Optimizations:
     * - Deduplicates concurrent fetches for the same package
     * - Uses cached version lists
     * - Caches resolution results
     */
    private resolveVersion;
    /**
     * Get package info from registry with caching
     *
     * Optimizations:
     * - Deduplicates concurrent fetches for the same package@version
     * - Caches results
     */
    private getPackageInfo;
    /**
     * Check peer dependencies and add warnings
     */
    private checkPeerDependencies;
    /**
     * Auto-install missing peer dependencies
     */
    private autoInstallPeerDeps;
    /**
     * Check if package is compatible with current platform
     */
    private isPlatformCompatible;
    /**
     * Create a shallow copy of a node without nested dependencies.
     * More efficient than destructuring spread for large objects.
     * Note: With exactOptionalPropertyTypes, we must only set optional properties
     * when they have a defined value.
     */
    private cloneNodeWithoutNested;
    /**
     * Hoist dependencies to the highest possible level.
     *
     * Optimizations:
     * - Uses efficient node cloning instead of spread operators
     * - Avoids unnecessary iterations through allResolvedNodes
     * - Two-pass algorithm for better cache locality
     * - Pre-processes version counts to avoid repeated lookups
     */
    private hoistDependencies;
    /**
     * Count how many packages were deduplicated
     */
    private countDeduplication;
    /**
     * Generate integrity hash placeholder
     */
    private generateIntegrity;
    /**
     * Generate resolved URL
     */
    private generateResolvedUrl;
}
/**
 * Detect circular dependencies in a resolved tree
 */
export declare function detectCircularDependencies(tree: DependencyTree): string[][];
//# sourceMappingURL=tree.d.ts.map