/**
 * Semver - Semantic Versioning for Edge Runtimes
 *
 * npm-compatible semver parsing, comparison, and range resolution.
 */
export type { ParseOptions, SatisfiesOptions, PrereleaseIdentifier, BuildIdentifier, SemVerObject, ReleaseType, ComparatorOperator, CompareResult, Comparator, Range, } from './types';
export { parse, valid, clean, coerce, SemVer } from './parse';
export { compare, rcompare, lt, gt, eq, neq, lte, gte, compareBuild, sort, rsort, diff, major, minor, patch, prerelease, } from './compare';
export { satisfies, maxSatisfying, minSatisfying, validRange, parseRange, intersects, clearCaches, } from './range';
//# sourceMappingURL=index.d.ts.map