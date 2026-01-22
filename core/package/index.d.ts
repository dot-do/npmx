/**
 * Package.json Parsing and Validation
 *
 * Main exports for package.json handling.
 * This module has ZERO Cloudflare dependencies.
 */
export type { PackageJson, PackageExports, ConditionalExports, PersonField, RepositoryField, BugsField, PublishConfig, ValidationResult, PackageJsonValidationError, PackageJsonValidationWarning, ErrorCode, WarningCode, NameValidationResult, VersionValidationResult, LicenseValidationResult, UrlValidationResult, HomepageValidationResult, ParsedDependency, ParsedScript, ParsedScripts, EntryPointOptions, EntryPointResult, ParsedFiles, ParsedBin, ParsedKeywords, NormalizedRepository, ValidateOptions, } from './types.js';
export { validatePackageName, validateVersion, validateLicense, validateBugsField, validateHomepage, } from './validate.js';
export { normalizeRepository } from './normalize.js';
export { parseDependencies, parseScripts, resolveEntryPoint, parseFiles, parseBin, parseKeywords, } from './parser.js';
import type { ValidationResult, ValidateOptions } from './types.js';
/**
 * Parses a JSON string into a validated PackageJson object.
 *
 * @param json - The JSON string to parse
 * @returns ValidationResult with parsed package and any errors/warnings
 */
export declare function parsePackageJson(json: string): ValidationResult;
/**
 * Validates a package.json object.
 *
 * @param pkg - The package object to validate
 * @param options - Validation options
 * @returns ValidationResult with parsed package and any errors/warnings
 */
export declare function validatePackageJson(pkg: unknown, options?: ValidateOptions): ValidationResult;
//# sourceMappingURL=index.d.ts.map