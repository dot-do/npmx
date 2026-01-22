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
import type { ResolvedPackage } from './types';
export type { DependencyTree, DependencyNode, ResolutionOptions, ResolutionWarning, ResolutionStats, PackageManifest, RegistryFetcher, LockFile, LockFileEntry, TreeDiff, ResolvedPackage, } from './types';
export { DependencyTreeBuilder, detectCircularDependencies } from './tree';
export { analyzeHoisting, applyHoisting, calculateDeduplicationSavings, type HoistingAnalysis, type HoistingConflict, type DeduplicationStats, } from './hoisting';
export { generateLockFile, parseLockFile, diffTrees, validateLockFile, type LockFileValidation, } from './lockfile';
export interface PackageMetadata {
    name: string;
    versions: Record<string, VersionMetadata>;
    'dist-tags': Record<string, string>;
    time?: Record<string, string>;
}
export interface VersionMetadata {
    name: string;
    version: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
    dist: {
        tarball: string;
        shasum: string;
        integrity?: string;
    };
}
export interface ResolveOptions {
    registry?: string;
    includePrerelease?: boolean;
}
/**
 * Resolve a package name and version range to a specific version.
 * @deprecated Use DependencyTreeBuilder.resolve() instead
 */
export declare function resolve(_name: string, _range: string, _options?: ResolveOptions): Promise<ResolvedPackage>;
/**
 * Fetch package metadata from the registry.
 * @deprecated Use RegistryFetcher interface instead
 */
export declare function fetchPackageMetadata(_name: string, _options?: ResolveOptions): Promise<PackageMetadata>;
/**
 * Resolve all dependencies for a package recursively.
 * @deprecated Use DependencyTreeBuilder.resolve() instead
 */
export declare function resolveDependencyTree(_name: string, _range: string, _options?: ResolveOptions): Promise<Map<string, ResolvedPackage>>;
//# sourceMappingURL=index.d.ts.map