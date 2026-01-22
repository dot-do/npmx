/**
 * Error formatting utilities for CLI
 */
/**
 * CLI error with command context
 */
export interface CLIError {
    command: string;
    message: string;
    package?: string;
    code?: string;
}
/**
 * Extract error message from unknown error
 */
export declare function getErrorMessage(err: unknown): string;
/**
 * Format error for CLI output with consistent styling
 *
 * Format: npmx <command>: <message>
 */
export declare function formatError(command: string, err: unknown): string;
/**
 * Create a missing argument error message
 */
export declare function missingArgumentError(command: string, argName: string): string;
/**
 * Create an unknown command error message
 */
export declare function unknownCommandError(command: string): string;
/**
 * Create a package not found error message
 */
export declare function packageNotFoundError(name: string): string;
/**
 * Create a version not found error message
 */
export declare function versionNotFoundError(name: string, version: string): string;
//# sourceMappingURL=errors.d.ts.map