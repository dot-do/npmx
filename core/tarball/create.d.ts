/**
 * Tarball creation for npm packages
 *
 * Creates gzipped tarballs in USTAR format with PAX support for long names
 */
import type { CreateOptions } from './types';
/**
 * Create a tarball from a map of files or a directory path
 *
 * @param input - Map of path -> content, or a directory path
 * @param options - Creation options
 * @returns Gzipped tarball data
 */
export declare function createTarball(input: Map<string, Uint8Array> | string, options?: CreateOptions): Promise<Uint8Array>;
/**
 * Streaming tarball creation
 *
 * @param files - Async iterator of [path, content] pairs
 * @param options - Creation options
 * @yields Chunks of gzipped tarball data
 */
export declare function streamCreateTarball(files: AsyncIterable<[string, Uint8Array]>, options?: CreateOptions): AsyncGenerator<Uint8Array>;
/**
 * Create a tarball with a single file (convenience function)
 */
export declare function createSingleFileTarball(path: string, content: Uint8Array | string, options?: {
    prefix?: string;
    mode?: number;
}): Promise<Uint8Array>;
/**
 * Create a tarball with a symlink (convenience function)
 */
export declare function createSymlinkTarball(path: string, target: string, options?: {
    prefix?: string;
}): Promise<Uint8Array>;
/**
 * Create a tarball with a hardlink (convenience function)
 */
export declare function createHardlinkTarball(path: string, target: string, options?: {
    prefix?: string;
}): Promise<Uint8Array>;
/**
 * Create a tarball with a directory (convenience function)
 */
export declare function createDirectoryTarball(path: string, options?: {
    prefix?: string;
    mode?: number;
}): Promise<Uint8Array>;
//# sourceMappingURL=create.d.ts.map