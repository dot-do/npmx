/**
 * Shared type definitions for npmx
 *
 * Single source of truth for all shared types across the package.
 *
 * @module npmx/types
 */
/**
 * Create an empty InstallResult with default values
 */
export function createEmptyInstallResult() {
    return {
        installed: [],
        removed: [],
        updated: [],
        stats: {
            resolved: 0,
            cached: 0,
            duration: 0,
        },
    };
}
//# sourceMappingURL=types.js.map