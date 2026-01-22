/**
 * Package.json Validation Functions
 *
 * Validators for package names, versions, licenses, URLs, and other fields.
 * This module has ZERO Cloudflare dependencies.
 */
import type { NameValidationResult, VersionValidationResult, LicenseValidationResult, UrlValidationResult, HomepageValidationResult, BugsField } from './types.js';
/**
 * Validates an npm package name according to npm naming rules.
 *
 * Rules:
 * - Must be lowercase
 * - Cannot start with . or _
 * - Cannot contain spaces or special characters
 * - Must be URL-safe
 * - Cannot be a Node.js core module name
 * - Cannot be a blacklisted name
 * - Maximum 214 characters
 */
export declare function validatePackageName(name: string): NameValidationResult;
/**
 * Validates a version string according to semver 2.0.0.
 */
export declare function validateVersion(version: string): VersionValidationResult;
/**
 * Validates a version range (for engines, dependencies)
 */
export declare function validateVersionRange(range: string): boolean;
/**
 * Validates a license field according to SPDX specification.
 */
export declare function validateLicense(license: string): LicenseValidationResult;
/**
 * Validates and normalizes the bugs field.
 */
export declare function validateBugsField(bugs: BugsField | undefined): UrlValidationResult;
/**
 * Validates the homepage field.
 */
export declare function validateHomepage(homepage: string | undefined): HomepageValidationResult;
//# sourceMappingURL=validate.d.ts.map