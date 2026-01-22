/**
 * Output formatting utilities for CLI
 */
import type { PackageEntry, SearchResult } from '../types';
/**
 * Format package list output
 */
export declare function formatPackageList(packages: PackageEntry[], options?: {
    long?: boolean;
    json?: boolean;
}): string;
/**
 * Format search results
 */
export declare function formatSearchResults(results: SearchResult[], options?: {
    json?: boolean;
}): string;
/**
 * Format package info
 */
export declare function formatPackageInfo(pkg: {
    name: string;
    version: string;
    description?: string;
    homepage?: string;
    repository?: string;
    license?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
}, options?: {
    json?: boolean;
}): string;
/**
 * Format install result
 */
export declare function formatInstallResult(installed: Array<{
    name: string;
    version: string;
}>, removed: Array<{
    name: string;
    version: string;
}>, updated: Array<{
    name: string;
    from: string;
    to: string;
}>): string;
/**
 * Format bytes to human readable
 */
export declare function formatBytes(bytes: number): string;
//# sourceMappingURL=format.d.ts.map