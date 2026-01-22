/**
 * Tarball extraction for npm packages
 *
 * Handles decompression, tar parsing, and file extraction
 */
import { type TarEntry, type ExtractOptions } from './types';
/**
 * Extract a tarball to an array of entries
 *
 * @param data - Tarball data (gzipped or raw tar)
 * @param options - Extraction options
 * @returns Array of extracted entries
 */
export declare function extractTarball(data: Uint8Array, options?: ExtractOptions): Promise<TarEntry[]>;
/**
 * Streaming extraction generator
 *
 * @param stream - Readable stream of tarball data
 * @yields Tar entries as they are extracted
 */
export declare function streamExtractTarball(stream: ReadableStream<Uint8Array>): AsyncGenerator<TarEntry>;
//# sourceMappingURL=extract.d.ts.map