/**
 * Semver Comparison Functions
 *
 * Compare, sort, and test version relationships.
 */
import type { CompareResult, ParseOptions } from './types';
import { SemVer } from './parse';
/**
 * Compare two versions.
 * Returns:
 *  - -1 if v1 < v2
 *  -  0 if v1 == v2
 *  -  1 if v1 > v2
 */
export declare function compare(v1: string | SemVer, v2: string | SemVer, options?: ParseOptions): CompareResult;
/**
 * Reverse compare: rcompare(v1, v2) = compare(v2, v1)
 */
export declare function rcompare(v1: string | SemVer, v2: string | SemVer, options?: ParseOptions): CompareResult;
/**
 * v1 < v2
 */
export declare function lt(v1: string | SemVer, v2: string | SemVer, options?: ParseOptions): boolean;
/**
 * v1 > v2
 */
export declare function gt(v1: string | SemVer, v2: string | SemVer, options?: ParseOptions): boolean;
/**
 * v1 == v2
 */
export declare function eq(v1: string | SemVer, v2: string | SemVer, options?: ParseOptions): boolean;
/**
 * v1 != v2
 */
export declare function neq(v1: string | SemVer, v2: string | SemVer, options?: ParseOptions): boolean;
/**
 * v1 <= v2
 */
export declare function lte(v1: string | SemVer, v2: string | SemVer, options?: ParseOptions): boolean;
/**
 * v1 >= v2
 */
export declare function gte(v1: string | SemVer, v2: string | SemVer, options?: ParseOptions): boolean;
/**
 * Compare build metadata (for sorting, not semver precedence)
 */
export declare function compareBuild(v1: string | SemVer, v2: string | SemVer, options?: ParseOptions): CompareResult;
/**
 * Sort an array of versions (ascending)
 */
export declare function sort(versions: (string | SemVer)[], options?: ParseOptions): (string | SemVer)[];
/**
 * Sort an array of versions (descending)
 */
export declare function rsort(versions: (string | SemVer)[], options?: ParseOptions): (string | SemVer)[];
/**
 * Return the difference between two versions (major, minor, patch, prerelease)
 */
export declare function diff(v1: string | SemVer, v2: string | SemVer, options?: ParseOptions): string | null;
/**
 * Get the major version number
 */
export declare function major(version: string | SemVer, options?: ParseOptions): number;
/**
 * Get the minor version number
 */
export declare function minor(version: string | SemVer, options?: ParseOptions): number;
/**
 * Get the patch version number
 */
export declare function patch(version: string | SemVer, options?: ParseOptions): number;
/**
 * Get the prerelease components
 */
export declare function prerelease(version: string | SemVer, options?: ParseOptions): readonly (string | number)[] | null;
//# sourceMappingURL=compare.d.ts.map