/**
 * Tarball handling for npm packages
 *
 * Provides compression, extraction, creation, and integrity verification
 * for npm package tarballs.
 *
 * This module has ZERO Cloudflare dependencies.
 *
 * @module core/tarball
 */
export type { TarEntry, TarHeader, TarEntryType, SparseRegion, ExtractOptions, CreateOptions, IntegrityHash, HashAlgorithm, VirtualFS, PaxExtendedHeader, } from './types';
export { TAR_BLOCK_SIZE, GZIP_MAGIC, TYPE_FLAGS } from './types';
export { decompress, compress, isGzipData } from './decompress';
export { parseTarHeader, parsePaxHeaders, createTarHeader, createPaxHeader, padToBlockSize, createEndOfArchive, } from './tar';
export { extractTarball, streamExtractTarball } from './extract';
export { createTarball, streamCreateTarball, createSingleFileTarball, createSymlinkTarball, createHardlinkTarball, createDirectoryTarball, } from './create';
export { calculateIntegrity, verifyIntegrity, parseIntegrity, createMultipleIntegrity, getStrongestHash, integrityEquals, IntegrityStream, } from './integrity';
//# sourceMappingURL=index.d.ts.map