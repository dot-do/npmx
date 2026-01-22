/**
 * Semver Parsing
 *
 * Parse, validate, clean, and coerce version strings.
 */
import type { ParseOptions, SemVerObject, PrereleaseIdentifier, BuildIdentifier, ReleaseType } from './types';
/**
 * Format version string from components
 */
declare function formatVersion(major: number, minor: number, patch: number, prerelease: PrereleaseIdentifier[], build: BuildIdentifier[]): string;
/**
 * SemVer class for working with semantic versions
 */
export declare class SemVer implements SemVerObject {
    major: number;
    minor: number;
    patch: number;
    prerelease: PrereleaseIdentifier[];
    build: BuildIdentifier[];
    version: string;
    raw: string;
    constructor(version: string | SemVer | SemVerObject, options?: ParseOptions);
    /**
     * Return the version string
     */
    toString(): string;
    /**
     * Compare this version to another
     */
    compare(other: string | SemVer): -1 | 0 | 1;
    /**
     * Increment the version
     */
    inc(release: ReleaseType, identifier?: string, identifierBase?: string | false): SemVer;
}
/**
 * Compare two SemVer objects
 */
declare function compareVersions(a: SemVerObject, b: SemVerObject): -1 | 0 | 1;
/**
 * Parse a version string into a SemVer object
 */
export declare function parse(version: string | null | undefined, options?: ParseOptions): SemVerObject | null;
/**
 * Return the valid version string if valid, or null
 */
export declare function valid(version: string | null | undefined, options?: ParseOptions): string | null;
/**
 * Clean a version string (strip leading v, =, whitespace)
 */
export declare function clean(version: string | null | undefined, options?: ParseOptions): string | null;
/**
 * Coerce a string into a valid semver version if possible
 */
export declare function coerce(version: string | null | undefined, _options?: ParseOptions): SemVer | null;
export { compareVersions, formatVersion };
//# sourceMappingURL=parse.d.ts.map