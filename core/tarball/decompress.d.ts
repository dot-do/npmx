/**
 * Gzip decompression for npm tarballs
 *
 * npm packages are distributed as gzipped tarballs (.tgz)
 */
/**
 * Decompress gzip data
 *
 * @param data - Gzipped data
 * @returns Decompressed data
 * @throws Error if data is not valid gzip
 */
export declare function decompress(data: Uint8Array): Promise<Uint8Array>;
/**
 * Check if data is gzip compressed
 *
 * @param data - Data to check
 * @returns true if data appears to be gzip compressed
 */
export declare function isGzipData(data: Uint8Array): boolean;
/**
 * Compress data using gzip
 *
 * @param data - Data to compress
 * @returns Gzipped data
 */
export declare function compress(data: Uint8Array): Promise<Uint8Array>;
//# sourceMappingURL=decompress.d.ts.map