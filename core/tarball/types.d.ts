/**
 * Types for npm tarball handling
 *
 * Supports USTAR and PAX extended headers
 */
/**
 * Entry type in a tar archive
 */
export type TarEntryType = 'file' | 'directory' | 'symlink' | 'hardlink' | 'pax-global' | 'pax-extended' | 'character-device' | 'block-device' | 'fifo' | 'contiguous' | 'gnu-longname' | 'gnu-longlink' | 'unknown';
/**
 * Sparse file region
 */
export interface SparseRegion {
    offset: number;
    size: number;
}
/**
 * Parsed tar header
 */
export interface TarHeader {
    /** File name (up to 100 chars, or combined with prefix) */
    name: string;
    /** File mode (permissions) */
    mode: number;
    /** Owner user ID */
    uid: number;
    /** Owner group ID */
    gid: number;
    /** File size in bytes */
    size: number;
    /** Modification time */
    mtime: Date;
    /** Entry type */
    type: TarEntryType;
    /** Link target for symlinks/hardlinks */
    linkname: string;
    /** Tar format: 'ustar', 'pax', 'gnu', 'v7', or 'unknown' */
    format: 'ustar' | 'pax' | 'gnu' | 'v7' | 'unknown';
    /** USTAR version (usually '00') */
    version: string;
    /** Owner user name */
    uname: string;
    /** Owner group name */
    gname: string;
    /** Device major number (for device files) */
    devmajor: number;
    /** Device minor number (for device files) */
    devminor: number;
    /** USTAR prefix for long paths (up to 155 chars) */
    prefix: string;
    /** Full path (prefix + name) */
    fullPath: string;
    /** Whether the checksum is valid */
    checksumValid: boolean;
    /** Whether this is a null block (end of archive) */
    isNullBlock: boolean;
}
/**
 * Extracted tar entry with content
 */
export interface TarEntry {
    /** Normalized file name (after prefix stripping) */
    name: string;
    /** Entry type */
    type: TarEntryType;
    /** File mode (permissions) */
    mode: number;
    /** Owner user ID */
    uid: number;
    /** Owner group ID */
    gid: number;
    /** File size in bytes */
    size: number;
    /** Modification time */
    mtime: Date;
    /** File content (empty for directories/symlinks) */
    content: Uint8Array;
    /** Link target for symlinks/hardlinks */
    linkname?: string;
    /** Sparse file regions */
    sparse?: SparseRegion[];
}
/**
 * Virtual filesystem interface for extraction
 */
export interface VirtualFS {
    writeFileSync(path: string, content: Uint8Array, options?: {
        mode?: number;
    }): void;
    mkdirSync?(path: string, options?: {
        recursive?: boolean;
    }): void;
    symlinkSync?(target: string, path: string): void;
    existsSync(path: string): boolean;
}
/**
 * Options for tarball extraction
 */
export interface ExtractOptions {
    /** Number of path components to strip from the beginning (default: 0) */
    stripPrefix?: number;
    /** Virtual filesystem to extract to */
    output?: VirtualFS;
    /** Enable security checks (path traversal, symlink escape) */
    secure?: boolean;
    /** Progress callback */
    onProgress?: (entry: TarEntry, bytesProcessed: number) => void;
    /** Start offset for resumable extraction */
    startOffset?: number;
    /** Maximum number of entries to extract */
    limit?: number;
}
/**
 * Options for tarball creation
 */
export interface CreateOptions {
    /** Prefix to add to all paths (e.g., 'package/') */
    prefix?: string;
    /** File modes map (path -> mode) */
    modes?: Map<string, number>;
    /** File sizes map for large files (path -> size) */
    sizes?: Map<string, number>;
    /** Virtual filesystem source for directory-based creation */
    source?: VirtualFS & {
        readdirSync?(path: string): string[];
        statSync?(path: string): {
            isDirectory(): boolean;
            size: number;
            mode: number;
        };
        readFileSync?(path: string): Uint8Array;
    };
    /** Callback when tarball creation is complete */
    onComplete?: (hash: IntegrityHash) => void;
}
/**
 * Integrity hash string (e.g., 'sha512-...')
 */
export type IntegrityHash = string;
/**
 * Supported hash algorithms
 */
export type HashAlgorithm = 'sha512' | 'sha256' | 'sha1';
/**
 * PAX extended header key-value pair
 */
export interface PaxExtendedHeader {
    path?: string;
    linkpath?: string;
    size?: number;
    uid?: number;
    gid?: number;
    uname?: string;
    gname?: string;
    mtime?: number;
    atime?: number;
    ctime?: number;
    [key: string]: string | number | undefined;
}
/**
 * Constants for tar format
 */
export declare const TAR_BLOCK_SIZE = 512;
export declare const GZIP_MAGIC: Uint8Array<ArrayBuffer>;
/**
 * Type flag characters
 */
export declare const TYPE_FLAGS: {
    readonly FILE: 48;
    readonly HARDLINK: 49;
    readonly SYMLINK: 50;
    readonly CHAR_DEVICE: 51;
    readonly BLOCK_DEVICE: 52;
    readonly DIRECTORY: 53;
    readonly FIFO: 54;
    readonly CONTIGUOUS: 55;
    readonly PAX_EXTENDED: 120;
    readonly PAX_GLOBAL: 103;
    readonly GNU_LONGNAME: 76;
    readonly GNU_LONGLINK: 75;
};
//# sourceMappingURL=types.d.ts.map