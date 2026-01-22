/**
 * Security Policy for AI Agent Package Installation
 *
 * Provides allowlist/blocklist enforcement, license checking,
 * vulnerability threshold enforcement, and package size limits.
 *
 * Prevents AI agents from installing malicious or unauthorized packages.
 *
 * @module npmx/core/security/policy
 */
import { SecurityError } from '../errors/index.js';
/**
 * Vulnerability severity levels (ordered from most to least severe)
 */
export type VulnerabilitySeverity = 'critical' | 'high' | 'medium' | 'low';
/**
 * Configuration for npm security policy
 */
export interface NpmSecurityConfig {
    /** Packages explicitly allowed (supports wildcards like @types/*) */
    allowlist?: string[];
    /** Packages explicitly blocked (supports wildcards) */
    blocklist?: string[];
    /** SPDX license identifiers that are allowed */
    allowedLicenses?: string[];
    /** Maximum allowed vulnerability severity */
    maxVulnerabilitySeverity?: VulnerabilitySeverity;
    /** Maximum allowed package size in bytes */
    maxPackageSize?: number;
}
/**
 * Information about a vulnerability
 */
export interface VulnerabilityInfo {
    severity: VulnerabilitySeverity;
    advisory: string;
    title: string;
}
/**
 * Types of security violations
 */
export type ViolationType = 'not_in_allowlist' | 'blocklisted' | 'license_violation' | 'vulnerability' | 'size_exceeded';
/**
 * Details about a security violation
 */
export interface SecurityViolation {
    type: ViolationType;
    package: string;
    message: string;
    suggestion: string;
    details?: string;
    severity?: VulnerabilitySeverity;
}
/**
 * Result of a security check
 */
export interface SecurityCheckResult {
    allowed: boolean;
    package: string;
    violations: SecurityViolation[];
}
/**
 * Package metadata for full security check
 */
export interface PackageSecurityMetadata {
    license?: string;
    vulnerabilities?: VulnerabilityInfo[];
    size?: number;
}
/**
 * Security policy for package installation
 *
 * Enforces allowlist/blocklist, license requirements,
 * vulnerability thresholds, and size limits.
 */
export declare class SecurityPolicy {
    private readonly config;
    private readonly allowlistPatterns;
    private readonly blocklistPatterns;
    constructor(config: NpmSecurityConfig);
    /**
     * Validate configuration values
     */
    private validateConfig;
    /**
     * Compile glob-like patterns to RegExp
     */
    private compilePatterns;
    /**
     * Check if a package matches any pattern in a list
     */
    private matchesPattern;
    /**
     * Check if a package is allowed by allowlist/blocklist rules
     */
    check(packageName: string): SecurityCheckResult;
    /**
     * Check if a package's license is allowed
     */
    checkLicense(packageName: string, license: string | undefined): SecurityCheckResult;
    /**
     * Check SPDX license expression against allowed licenses
     */
    private checkSpdxLicense;
    /**
     * Check if vulnerabilities exceed threshold
     */
    checkVulnerabilities(packageName: string, vulnerabilities: VulnerabilityInfo[] | undefined): SecurityCheckResult;
    /**
     * Check if package size is within limits
     */
    checkSize(packageName: string, sizeBytes: number): SecurityCheckResult;
    /**
     * Perform all security checks on a package
     */
    checkAll(packageName: string, metadata?: PackageSecurityMetadata): SecurityCheckResult;
    /**
     * Convert check result to SecurityError
     */
    toSecurityError(result: SecurityCheckResult): SecurityError;
    /**
     * Assert that a package passes basic security check, throw if not
     */
    assert(packageName: string): void;
    /**
     * Assert that a package passes all security checks, throw if not
     */
    assertAll(packageName: string, metadata?: PackageSecurityMetadata): void;
    /**
     * Create a policy from a preset
     */
    static preset(name: 'restricted' | 'standard' | 'permissive'): SecurityPolicy;
    /**
     * Create a new policy by extending this one with additional constraints
     */
    extend(additional: NpmSecurityConfig): SecurityPolicy;
    /**
     * Serialize policy configuration to JSON-serializable object
     */
    toJSON(): NpmSecurityConfig;
    /**
     * Create a policy from JSON configuration
     */
    static fromJSON(json: NpmSecurityConfig): SecurityPolicy;
}
export type { NpmSecurityConfig as SecurityConfig, };
//# sourceMappingURL=policy.d.ts.map