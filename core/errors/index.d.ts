/**
 * NPM Error Types
 *
 * Structured error types for npm operations with:
 * - Typed error codes for programmatic handling
 * - Helpful messages with context
 * - JSON serialization for RPC
 */
/**
 * Error codes for npm operations
 */
export type NpmErrorCode = 'ENOTFOUND' | 'EFETCH' | 'EINSTALL' | 'EEXEC' | 'ESECURITY' | 'EVALIDATION' | 'ETIMEOUT' | 'ERESOLUTION' | 'ETARBALL' | 'EPARSE';
/**
 * Context for package-related errors
 */
export interface NpmErrorContext {
    package?: string | undefined;
    version?: string | undefined;
    registry?: string | undefined;
    path?: string | undefined;
    cause?: string | undefined;
}
/**
 * JSON-serializable error representation
 */
export interface NpmErrorJSON {
    name: string;
    code: NpmErrorCode;
    message: string;
    context?: NpmErrorContext | undefined;
    stack?: string | undefined;
}
/**
 * Base error class for npm operations
 *
 * Features:
 * - Typed error codes
 * - Optional context (package, version, etc.)
 * - JSON serialization for RPC
 * - Proper instanceof checks
 */
export declare class NpmError extends Error {
    readonly code: NpmErrorCode;
    readonly context?: NpmErrorContext;
    constructor(code: NpmErrorCode, message: string, context?: NpmErrorContext);
    /**
     * Serialize error for JSON transport (RPC)
     */
    toJSON(): NpmErrorJSON;
    /**
     * Create NpmError from JSON representation
     */
    static fromJSON(json: NpmErrorJSON): NpmError;
}
/**
 * Package or version not found in registry
 */
export declare class PackageNotFoundError extends NpmError {
    constructor(packageName: string, version?: string);
}
/**
 * Network fetch failed
 */
export declare class FetchError extends NpmError {
    readonly status?: number;
    constructor(message: string, options?: {
        status?: number;
        registry?: string;
    });
}
/**
 * Package installation failed
 */
export declare class InstallError extends NpmError {
    constructor(message: string, packageName?: string);
}
/**
 * Command/binary execution failed
 */
export declare class ExecError extends NpmError {
    readonly exitCode?: number;
    constructor(message: string, options?: {
        package?: string;
        exitCode?: number;
    });
}
/**
 * Security violation (blocked package, vulnerability, etc.)
 */
export declare class SecurityError extends NpmError {
    readonly severity?: 'critical' | 'high' | 'medium' | 'low';
    constructor(message: string, options?: {
        package?: string;
        severity?: 'critical' | 'high' | 'medium' | 'low';
    });
}
/**
 * Invalid input or data validation failed
 */
export declare class ValidationError extends NpmError {
    constructor(message: string, context?: NpmErrorContext);
}
/**
 * Operation timed out
 */
export declare class TimeoutError extends NpmError {
    readonly timeoutMs?: number;
    constructor(message: string, timeoutMs?: number);
}
/**
 * Dependency resolution failed
 */
export declare class ResolutionError extends NpmError {
    constructor(message: string, packageName?: string, version?: string);
}
/**
 * Tarball extraction failed
 */
export declare class TarballError extends NpmError {
    constructor(message: string, packageName?: string);
}
/**
 * Parsing failed (semver, package.json, etc.)
 */
export declare class ParseError extends NpmError {
    constructor(message: string, context?: NpmErrorContext);
}
/**
 * Check if an error is an NpmError
 */
export declare function isNpmError(error: unknown): error is NpmError;
/**
 * Check if an error has a specific code
 */
export declare function hasErrorCode(error: unknown, code: NpmErrorCode): boolean;
/**
 * Wrap an unknown error as an NpmError
 */
export declare function wrapError(error: unknown, code?: NpmErrorCode): NpmError;
//# sourceMappingURL=index.d.ts.map