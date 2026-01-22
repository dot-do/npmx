/**
 * Tar header parsing and creation
 *
 * Supports USTAR, PAX extended headers, and legacy formats
 */
import { type TarHeader, type TarEntryType, type PaxExtendedHeader } from './types';
/**
 * Parse a tar header from a 512-byte block
 *
 * @param header - 512-byte header block
 * @returns Parsed header information
 */
export declare function parseTarHeader(header: Uint8Array): TarHeader;
/**
 * Parse PAX extended header content
 *
 * Format: "length key=value\n" for each entry
 */
export declare function parsePaxHeaders(content: Uint8Array): PaxExtendedHeader;
/**
 * Create a PAX extended header block
 */
export declare function createPaxHeader(headers: PaxExtendedHeader): Uint8Array;
/**
 * Create a USTAR tar header
 */
export declare function createTarHeader(name: string, size: number, options?: {
    mode?: number;
    uid?: number;
    gid?: number;
    mtime?: Date;
    type?: TarEntryType;
    linkname?: string;
    uname?: string;
    gname?: string;
    prefix?: string;
}): Uint8Array;
/**
 * Pad data to tar block boundary
 */
export declare function padToBlockSize(data: Uint8Array): Uint8Array;
/**
 * Create end-of-archive marker (two null blocks)
 */
export declare function createEndOfArchive(): Uint8Array;
//# sourceMappingURL=tar.d.ts.map