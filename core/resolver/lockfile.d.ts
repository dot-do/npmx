/**
 * Lock File Generation and Parsing
 *
 * Generates npm v3 compatible package-lock.json files.
 */
import type { DependencyTree, LockFile, TreeDiff } from './types';
/**
 * Generate a package-lock.json (v3) from a resolved dependency tree
 */
export declare function generateLockFile(tree: DependencyTree): LockFile;
/**
 * Parse a package-lock.json file into a DependencyTree
 */
export declare function parseLockFile(lockfile: LockFile): DependencyTree;
/**
 * Diff two dependency trees to find changes
 */
export declare function diffTrees(before: DependencyTree, after: DependencyTree): TreeDiff;
/**
 * Validate a lockfile's integrity
 */
export declare function validateLockFile(lockfile: LockFile): LockFileValidation;
export interface LockFileValidation {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
//# sourceMappingURL=lockfile.d.ts.map