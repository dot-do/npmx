/**
 * NPM Error Types
 *
 * Structured error types for npm operations with:
 * - Typed error codes for programmatic handling
 * - Helpful messages with context
 * - JSON serialization for RPC
 */
// =============================================================================
// Base Error Class
// =============================================================================
/**
 * Base error class for npm operations
 *
 * Features:
 * - Typed error codes
 * - Optional context (package, version, etc.)
 * - JSON serialization for RPC
 * - Proper instanceof checks
 */
export class NpmError extends Error {
    code;
    context;
    constructor(code, message, context) {
        super(message);
        this.name = 'NpmError';
        this.code = code;
        this.context = context;
        // Fix prototype chain for instanceof checks
        Object.setPrototypeOf(this, new.target.prototype);
    }
    /**
     * Serialize error for JSON transport (RPC)
     */
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            context: this.context,
            stack: this.stack,
        };
    }
    /**
     * Create NpmError from JSON representation
     */
    static fromJSON(json) {
        const error = new NpmError(json.code, json.message, json.context);
        if (json.stack) {
            error.stack = json.stack;
        }
        return error;
    }
}
// =============================================================================
// Specific Error Classes
// =============================================================================
/**
 * Package or version not found in registry
 */
export class PackageNotFoundError extends NpmError {
    constructor(packageName, version) {
        const message = version
            ? `Package not found: ${packageName}@${version}`
            : `Package not found: ${packageName}`;
        super('ENOTFOUND', message, { package: packageName, version });
        this.name = 'PackageNotFoundError';
    }
}
/**
 * Network fetch failed
 */
export class FetchError extends NpmError {
    status;
    constructor(message, options) {
        super('EFETCH', message, { registry: options?.registry });
        this.name = 'FetchError';
        this.status = options?.status;
    }
}
/**
 * Package installation failed
 */
export class InstallError extends NpmError {
    constructor(message, packageName) {
        super('EINSTALL', message, { package: packageName });
        this.name = 'InstallError';
    }
}
/**
 * Command/binary execution failed
 */
export class ExecError extends NpmError {
    exitCode;
    constructor(message, options) {
        super('EEXEC', message, { package: options?.package });
        this.name = 'ExecError';
        this.exitCode = options?.exitCode;
    }
}
/**
 * Security violation (blocked package, vulnerability, etc.)
 */
export class SecurityError extends NpmError {
    severity;
    constructor(message, options) {
        super('ESECURITY', message, { package: options?.package });
        this.name = 'SecurityError';
        this.severity = options?.severity;
    }
}
/**
 * Invalid input or data validation failed
 */
export class ValidationError extends NpmError {
    constructor(message, context) {
        super('EVALIDATION', message, context);
        this.name = 'ValidationError';
    }
}
/**
 * Operation timed out
 */
export class TimeoutError extends NpmError {
    timeoutMs;
    constructor(message, timeoutMs) {
        super('ETIMEOUT', message);
        this.name = 'TimeoutError';
        this.timeoutMs = timeoutMs;
    }
}
/**
 * Dependency resolution failed
 */
export class ResolutionError extends NpmError {
    constructor(message, packageName, version) {
        super('ERESOLUTION', message, { package: packageName, version });
        this.name = 'ResolutionError';
    }
}
/**
 * Tarball extraction failed
 */
export class TarballError extends NpmError {
    constructor(message, packageName) {
        super('ETARBALL', message, { package: packageName });
        this.name = 'TarballError';
    }
}
/**
 * Parsing failed (semver, package.json, etc.)
 */
export class ParseError extends NpmError {
    constructor(message, context) {
        super('EPARSE', message, context);
        this.name = 'ParseError';
    }
}
// =============================================================================
// Error Type Guards
// =============================================================================
/**
 * Check if an error is an NpmError
 */
export function isNpmError(error) {
    return error instanceof NpmError;
}
/**
 * Check if an error has a specific code
 */
export function hasErrorCode(error, code) {
    return isNpmError(error) && error.code === code;
}
// =============================================================================
// Error Utilities
// =============================================================================
/**
 * Wrap an unknown error as an NpmError
 */
export function wrapError(error, code = 'EVALIDATION') {
    if (isNpmError(error)) {
        return error;
    }
    if (error instanceof Error) {
        return new NpmError(code, error.message, { cause: error.message });
    }
    return new NpmError(code, String(error));
}
//# sourceMappingURL=index.js.map