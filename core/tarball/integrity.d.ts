/**
 * Integrity checking for npm packages
 *
 * Implements Subresource Integrity (SRI) compatible hashing
 * Uses the format: algorithm-base64hash (e.g., sha512-...)
 */
import type { IntegrityHash, HashAlgorithm } from './types';
/**
 * Calculate an integrity hash for data
 *
 * @param data - Data to hash
 * @param algorithm - Hash algorithm (sha512, sha256, sha1)
 * @returns Integrity hash string in SRI format
 */
export declare function calculateIntegrity(data: Uint8Array, algorithm: HashAlgorithm): Promise<IntegrityHash>;
/**
 * Verify data against an integrity hash
 *
 * @param data - Data to verify
 * @param hash - Integrity hash (supports SSRI format with multiple hashes)
 * @returns true if the hash matches
 */
export declare function verifyIntegrity(data: Uint8Array, hash: IntegrityHash): Promise<boolean>;
/**
 * Parse an integrity string into its components
 *
 * @param hash - Integrity hash string
 * @returns Parsed components or null if invalid
 */
export declare function parseIntegrity(hash: IntegrityHash): {
    algorithm: HashAlgorithm;
    digest: string;
}[];
/**
 * Create an integrity string from multiple algorithms
 *
 * @param data - Data to hash
 * @param algorithms - List of algorithms to use
 * @returns Combined integrity string (SSRI format)
 */
export declare function createMultipleIntegrity(data: Uint8Array, algorithms: HashAlgorithm[]): Promise<IntegrityHash>;
/**
 * Get the strongest available hash from an SSRI string
 *
 * @param hash - SSRI integrity string
 * @returns The strongest hash, or the first one if no preference
 */
export declare function getStrongestHash(hash: IntegrityHash): IntegrityHash;
/**
 * Compare two integrity strings for equality
 *
 * @param hash1 - First integrity hash
 * @param hash2 - Second integrity hash
 * @returns true if any hash matches
 */
export declare function integrityEquals(hash1: IntegrityHash, hash2: IntegrityHash): boolean;
/**
 * Convert base64 string to ArrayBuffer
 */
export declare function base64ToArrayBuffer(base64: string): ArrayBuffer;
/**
 * Stream-based integrity calculation
 *
 * This is useful for calculating integrity while streaming data
 */
export declare class IntegrityStream {
    private chunks;
    private totalLength;
    private algorithm;
    constructor(algorithm?: HashAlgorithm);
    /**
     * Add a chunk of data
     */
    update(chunk: Uint8Array): void;
    /**
     * Calculate the final integrity hash
     */
    digest(): Promise<IntegrityHash>;
    /**
     * Reset the stream for reuse
     */
    reset(): void;
}
//# sourceMappingURL=integrity.d.ts.map