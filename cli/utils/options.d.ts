/**
 * Command-line option parsing utilities
 */
/**
 * Parsed options result
 */
export interface ParsedOptions {
    options: Record<string, boolean | string>;
    packages: string[];
}
/**
 * Parse command arguments into options and package names
 *
 * Supports:
 * - Long options: --save, --global
 * - Short options: -S, -g
 * - Value options: --registry=url, --depth=2
 */
export declare function parseOptions(args: string[]): ParsedOptions;
//# sourceMappingURL=options.d.ts.map