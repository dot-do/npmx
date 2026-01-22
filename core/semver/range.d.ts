/**
 * Semver Range Resolution
 *
 * Parse and evaluate version ranges with npm-compatible semantics.
 *
 * Performance optimizations:
 * - LRU cache for parsed ranges (avoids repeated regex parsing)
 * - LRU cache for parsed versions (avoids repeated string parsing)
 * - Memoized satisfies checks for common version/range pairs
 */
import type { SatisfiesOptions, Range } from './types';
/**
 * Clear all caches (useful for testing or memory management)
 */
export declare function clearCaches(): void;
/**
 * Parse a range string into a Range object (cached)
 */
export declare function parseRange(range: string, options?: SatisfiesOptions): Range | null;
/**
 * Check if a version satisfies a range (with caching)
 */
export declare function satisfies(version: string, range: string, options?: SatisfiesOptions): boolean;
/**
 * Return the highest version that satisfies the range
 *
 * Optimized to:
 * 1. Parse the range once and reuse
 * 2. Avoid redundant version parsing (cached)
 * 3. Use pre-parsed versions for comparison
 */
export declare function maxSatisfying(versions: string[], range: string, options?: SatisfiesOptions): string | null;
/**
 * Return the lowest version that satisfies the range
 *
 * Optimized to use cached parsing (same as maxSatisfying)
 */
export declare function minSatisfying(versions: string[], range: string, options?: SatisfiesOptions): string | null;
/**
 * Return the valid range string, or null if invalid
 */
export declare function validRange(range: string, options?: SatisfiesOptions): string | null;
/**
 * Check if two ranges have any overlap
 */
export declare function intersects(range1: string, range2: string, options?: SatisfiesOptions): boolean;
//# sourceMappingURL=range.d.ts.map