/**
 * Package.json Parsing Functions
 *
 * Parses dependencies, scripts, entry points, files, bin, and keywords.
 * This module has ZERO Cloudflare dependencies.
 */
import type { ParsedDependency, ParsedScripts, ParsedFiles, ParsedBin, ParsedKeywords, ParseFilesOptions, ParseBinOptions, ParseKeywordsOptions, EntryPointOptions, EntryPointResult, PackageJson } from './types.js';
/**
 * Parses a dependencies object into structured dependency information.
 */
export declare function parseDependencies(deps: Record<string, string> | undefined, options?: {
    validate?: boolean;
}): ParsedDependency[];
/**
 * Parses a scripts object into structured script information.
 */
export declare function parseScripts(scripts: Record<string, string> | undefined): ParsedScripts;
/**
 * Resolves the entry point for a package based on exports, main, module fields.
 */
export declare function resolveEntryPoint(pkg: Partial<PackageJson>, options?: EntryPointOptions): EntryPointResult;
/**
 * Parses the files field with validation and warnings.
 */
export declare function parseFiles(files: string[] | undefined, options?: ParseFilesOptions): ParsedFiles;
/**
 * Parses the bin field into a normalized object.
 */
export declare function parseBin(pkg: Partial<PackageJson>, options?: ParseBinOptions): ParsedBin;
/**
 * Parses and normalizes keywords array.
 */
export declare function parseKeywords(keywords: unknown[] | undefined, options?: ParseKeywordsOptions): ParsedKeywords | string[];
//# sourceMappingURL=parser.d.ts.map