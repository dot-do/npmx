/**
 * @dotdo/npmx - NPM/NPX capabilities for edge runtimes
 *
 * This is the main entry point for the core library.
 * All modules in core/ have ZERO Cloudflare dependencies and can be used
 * in any JavaScript runtime (Node.js, Deno, Bun, browsers, etc.)
 */
export * as semver from './semver/index.js';
export type { SatisfiesOptions, Range, } from './semver/index.js';
export * as resolver from './resolver/index.js';
export type { PackageMetadata, VersionMetadata, ResolveOptions, ResolvedPackage, DependencyTree, DependencyNode, ResolutionOptions, LockFile, } from './resolver/index.js';
export * as pkg from './package/index.js';
export type { PackageJson, ParseOptions, ValidationResult, } from './package/index.js';
export * as tarball from './tarball/index.js';
export type { ExtractOptions, TarEntry, TarHeader, IntegrityHash, CreateOptions, } from './tarball/index.js';
export * from './errors/index.js';
export * as cache from './cache/index.js';
export type { CacheOptions, CacheStats, } from './cache/index.js';
export { LRUCache } from './cache/index.js';
export * as security from './security/index.js';
export type { NpmSecurityConfig, SecurityCheckResult, SecurityViolation, VulnerabilitySeverity, ViolationType, VulnerabilityInfo, PackageSecurityMetadata, } from './security/index.js';
export { SecurityPolicy } from './security/index.js';
//# sourceMappingURL=index.d.ts.map