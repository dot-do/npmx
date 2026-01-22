/**
 * Tarball creation for npm packages
 *
 * Creates gzipped tarballs in USTAR format with PAX support for long names
 */
import { compress } from './decompress';
import { createTarHeader, createPaxHeader, padToBlockSize, createEndOfArchive } from './tar';
import { calculateIntegrity } from './integrity';
const textEncoder = new TextEncoder();
/**
 * Create a tarball from a map of files or a directory path
 *
 * @param input - Map of path -> content, or a directory path
 * @param options - Creation options
 * @returns Gzipped tarball data
 */
export async function createTarball(input, options = {}) {
    const { prefix = '', modes = new Map(), sizes = new Map(), source, onComplete } = options;
    let files;
    if (typeof input === 'string') {
        // Read from virtual filesystem
        if (!source?.readdirSync || !source?.statSync || !source?.readFileSync) {
            throw new Error('Source filesystem must implement readdirSync, statSync, and readFileSync');
        }
        files = readDirectoryRecursive(input, {
            readdirSync: source.readdirSync,
            statSync: source.statSync,
            readFileSync: source.readFileSync,
        }, prefix);
    }
    else {
        files = input;
    }
    // Build tar archive
    const chunks = [];
    for (const [path, content] of files) {
        const fullPath = prefix ? `${prefix}${path}` : path;
        const mode = modes.get(path) ?? 0o644;
        const size = sizes.get(path) ?? content.length;
        const isDirectory = path.endsWith('/');
        // Check if we need PAX headers
        const needsPax = fullPath.length > 100 || size > 8589934591; // 8GB - 1
        if (needsPax && !isDirectory) {
            // Create PAX extended header
            const paxContent = createPaxHeader({
                path: fullPath,
                size: size,
            });
            const paxHeader = createTarHeader('PaxHeader/' + path.slice(0, 80), paxContent.length, {
                type: 'pax-extended',
                mode: 0o644,
            });
            chunks.push(paxHeader);
            chunks.push(padToBlockSize(paxContent));
            // Regular header with truncated name
            const regularHeader = createTarHeader(fullPath.slice(0, 100), size, {
                mode: isDirectory ? 0o755 : mode,
                type: isDirectory ? 'directory' : 'file',
            });
            chunks.push(regularHeader);
        }
        else {
            // Standard USTAR header
            let name = fullPath;
            let headerPrefix = '';
            // Split long paths into prefix and name
            if (name.length > 100) {
                const splitIndex = name.lastIndexOf('/', 100);
                if (splitIndex > 0 && name.length - splitIndex <= 100) {
                    headerPrefix = name.slice(0, splitIndex);
                    name = name.slice(splitIndex + 1);
                }
            }
            const header = createTarHeader(name, isDirectory ? 0 : size, {
                mode: isDirectory ? 0o755 : mode,
                type: isDirectory ? 'directory' : 'file',
                prefix: headerPrefix,
            });
            chunks.push(header);
        }
        // Add content for regular files
        if (!isDirectory && content.length > 0) {
            chunks.push(padToBlockSize(content));
        }
    }
    // Add end of archive marker
    chunks.push(createEndOfArchive());
    // Combine chunks
    const tarData = concatArrays(chunks);
    // Compress with gzip
    const gzipped = await compress(tarData);
    // Calculate integrity if callback provided
    if (onComplete) {
        const hash = await calculateIntegrity(gzipped, 'sha512');
        onComplete(hash);
    }
    return gzipped;
}
/**
 * Streaming tarball creation
 *
 * @param files - Async iterator of [path, content] pairs
 * @param options - Creation options
 * @yields Chunks of gzipped tarball data
 */
export async function* streamCreateTarball(files, options = {}) {
    const { prefix = '', modes = new Map() } = options;
    // We need to collect all chunks first since gzip needs complete data
    // For true streaming, we'd need to use a streaming gzip implementation
    const chunks = [];
    for await (const [path, content] of files) {
        const fullPath = prefix ? `${prefix}${path}` : path;
        const mode = modes.get(path) ?? 0o644;
        const isDirectory = path.endsWith('/');
        // Create header
        let name = fullPath;
        let headerPrefix = '';
        if (name.length > 100) {
            const splitIndex = name.lastIndexOf('/', 100);
            if (splitIndex > 0 && name.length - splitIndex <= 100) {
                headerPrefix = name.slice(0, splitIndex);
                name = name.slice(splitIndex + 1);
            }
        }
        // For very long names, use PAX
        if (fullPath.length > 100 && !headerPrefix) {
            const paxContent = createPaxHeader({ path: fullPath });
            const paxHeader = createTarHeader('PaxHeader/' + path.slice(0, 80), paxContent.length, {
                type: 'pax-extended',
                mode: 0o644,
            });
            chunks.push(paxHeader);
            chunks.push(padToBlockSize(paxContent));
            name = fullPath.slice(0, 100);
            headerPrefix = '';
        }
        const header = createTarHeader(name, isDirectory ? 0 : content.length, {
            mode: isDirectory ? 0o755 : mode,
            type: isDirectory ? 'directory' : 'file',
            prefix: headerPrefix,
        });
        chunks.push(header);
        if (!isDirectory && content.length > 0) {
            chunks.push(padToBlockSize(content));
        }
    }
    // Add end of archive
    chunks.push(createEndOfArchive());
    // Combine and compress
    const tarData = concatArrays(chunks);
    const gzipped = await compress(tarData);
    // Yield in chunks for streaming
    const chunkSize = 65536;
    for (let i = 0; i < gzipped.length; i += chunkSize) {
        yield gzipped.subarray(i, Math.min(i + chunkSize, gzipped.length));
    }
}
/**
 * Read a directory recursively from a virtual filesystem
 */
function readDirectoryRecursive(dirPath, fs, _prefix) {
    const files = new Map();
    function walk(currentPath, relativePath) {
        const entries = fs.readdirSync(currentPath);
        for (const entry of entries) {
            const fullPath = currentPath + '/' + entry;
            const relPath = relativePath ? relativePath + '/' + entry : entry;
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                files.set(relPath + '/', new Uint8Array(0));
                walk(fullPath, relPath);
            }
            else {
                const content = fs.readFileSync(fullPath);
                files.set(relPath, content);
            }
        }
    }
    walk(dirPath, '');
    return files;
}
/**
 * Concatenate multiple Uint8Arrays
 */
function concatArrays(arrays) {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}
/**
 * Create a tarball with a single file (convenience function)
 */
export async function createSingleFileTarball(path, content, options = {}) {
    const { prefix = 'package/', mode = 0o644 } = options;
    const contentBytes = typeof content === 'string' ? textEncoder.encode(content) : content;
    return createTarball(new Map([[path, contentBytes]]), {
        prefix,
        modes: new Map([[path, mode]]),
    });
}
/**
 * Create a tarball with a symlink (convenience function)
 */
export async function createSymlinkTarball(path, target, options = {}) {
    const { prefix = 'package/' } = options;
    const fullPath = prefix + path;
    const header = createTarHeader(fullPath, 0, {
        type: 'symlink',
        linkname: target,
        mode: 0o777,
    });
    const tarData = concatArrays([header, createEndOfArchive()]);
    return compress(tarData);
}
/**
 * Create a tarball with a hardlink (convenience function)
 */
export async function createHardlinkTarball(path, target, options = {}) {
    const { prefix = 'package/' } = options;
    const fullPath = prefix + path;
    const header = createTarHeader(fullPath, 0, {
        type: 'hardlink',
        linkname: target,
        mode: 0o644,
    });
    const tarData = concatArrays([header, createEndOfArchive()]);
    return compress(tarData);
}
/**
 * Create a tarball with a directory (convenience function)
 */
export async function createDirectoryTarball(path, options = {}) {
    const { prefix = 'package/', mode = 0o755 } = options;
    const fullPath = prefix + (path.endsWith('/') ? path : path + '/');
    const header = createTarHeader(fullPath, 0, {
        type: 'directory',
        mode,
    });
    const tarData = concatArrays([header, createEndOfArchive()]);
    return compress(tarData);
}
//# sourceMappingURL=create.js.map