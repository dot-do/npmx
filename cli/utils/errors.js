/**
 * Error formatting utilities for CLI
 */
/**
 * Extract error message from unknown error
 */
export function getErrorMessage(err) {
    if (err instanceof Error) {
        return err.message;
    }
    return String(err);
}
/**
 * Format error for CLI output with consistent styling
 *
 * Format: npmx <command>: <message>
 */
export function formatError(command, err) {
    const message = getErrorMessage(err);
    return `npmx ${command}: ${message}`;
}
/**
 * Create a missing argument error message
 */
export function missingArgumentError(command, argName) {
    return `npmx ${command}: missing ${argName} argument`;
}
/**
 * Create an unknown command error message
 */
export function unknownCommandError(command) {
    return `npmx: unknown command '${command}'`;
}
/**
 * Create a package not found error message
 */
export function packageNotFoundError(name) {
    return `npmx: package '${name}' not found`;
}
/**
 * Create a version not found error message
 */
export function versionNotFoundError(name, version) {
    return `npmx: version '${version}' not found for package '${name}'`;
}
//# sourceMappingURL=errors.js.map