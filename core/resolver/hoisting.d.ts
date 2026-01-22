/**
 * Dependency Hoisting Logic
 *
 * Implements npm-style dependency hoisting to create a flat node_modules structure.
 * Handles version conflicts by nesting incompatible versions.
 */
import type { DependencyTree } from './types';
/**
 * Analyze dependency tree and determine optimal hoisting
 */
export declare function analyzeHoisting(tree: DependencyTree): HoistingAnalysis;
/**
 * Result of hoisting analysis
 */
export interface HoistingAnalysis {
    /** Packages that can be hoisted to root */
    hoistable: string[];
    /** Packages with version conflicts */
    conflicts: HoistingConflict[];
    /** Packages that must stay nested (bundled, etc.) */
    mustNest: string[];
}
export interface HoistingConflict {
    package: string;
    versions: string[];
    requesters: Array<{
        package: string;
        range: string;
        resolved: string;
    }>;
}
/**
 * Apply hoisting to a dependency tree
 * Returns a new tree with hoisted structure
 */
export declare function applyHoisting(tree: DependencyTree): DependencyTree;
/**
 * Calculate space savings from deduplication
 */
export declare function calculateDeduplicationSavings(tree: DependencyTree): DeduplicationStats;
export interface DeduplicationStats {
    totalPackages: number;
    totalInstances: number;
    deduplicatedCount: number;
}
//# sourceMappingURL=hoisting.d.ts.map