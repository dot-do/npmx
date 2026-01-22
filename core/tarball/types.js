/**
 * Types for npm tarball handling
 *
 * Supports USTAR and PAX extended headers
 */
/**
 * Constants for tar format
 */
export const TAR_BLOCK_SIZE = 512;
export const GZIP_MAGIC = new Uint8Array([0x1f, 0x8b]);
/**
 * Type flag characters
 */
export const TYPE_FLAGS = {
    FILE: 0x30, // '0' or NUL
    HARDLINK: 0x31, // '1'
    SYMLINK: 0x32, // '2'
    CHAR_DEVICE: 0x33, // '3'
    BLOCK_DEVICE: 0x34, // '4'
    DIRECTORY: 0x35, // '5'
    FIFO: 0x36, // '6'
    CONTIGUOUS: 0x37, // '7'
    PAX_EXTENDED: 0x78, // 'x'
    PAX_GLOBAL: 0x67, // 'g'
    GNU_LONGNAME: 0x4c, // 'L'
    GNU_LONGLINK: 0x4b, // 'K'
};
//# sourceMappingURL=types.js.map