/**
 * CLI for npmx - NPM/NPX for edge runtimes
 *
 * Commands:
 * - install [packages...]  - install packages
 * - uninstall <packages...> - remove packages
 * - list                   - list installed packages
 * - search <query>         - search npm registry
 * - info <package>         - show package info
 * - run <script>           - run package.json script
 * - exec <command>         - execute package binary
 * - init                   - create package.json
 * - publish                - publish to registry
 * - version [bump]         - bump version
 */
import { type CAC } from 'cac';
import type { CommandResult, PackageEntry, SearchResult } from './types';
export { formatPackageList, formatSearchResults, formatPackageInfo, formatInstallResult } from './utils';
/**
 * Mock registry interface for dependency injection
 */
interface MockRegistry {
    search: (query: string) => Promise<SearchResult[]>;
    info: (name: string, version?: string) => Promise<{
        name: string;
        version: string;
        description?: string;
        homepage?: string;
        repository?: string;
        license?: string;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
    }>;
    versions: (name: string) => Promise<string[]>;
}
/**
 * Mock package manager interface for dependency injection
 */
interface MockPackageManager {
    install: (packages: string[], options?: {
        dev?: boolean;
        exact?: boolean;
    }) => Promise<{
        installed: Array<{
            name: string;
            version: string;
        }>;
        removed: Array<{
            name: string;
            version: string;
        }>;
        updated: Array<{
            name: string;
            from: string;
            to: string;
        }>;
        stats: {
            resolved: number;
            cached: number;
            duration: number;
        };
    }>;
    uninstall: (packages: string[]) => Promise<void>;
    list: (options?: {
        depth?: number;
    }) => Promise<PackageEntry[]>;
    run: (script: string, args: string[]) => Promise<{
        exitCode: number;
        output: string;
    }>;
    exec: (command: string, args: string[]) => Promise<{
        exitCode: number;
        output: string;
    }>;
}
/**
 * Mock filesystem interface
 */
interface MockFS {
    readFile: (path: string) => Promise<string>;
    writeFile: (path: string, content: string) => Promise<void>;
    exists: (path: string) => Promise<boolean>;
}
/**
 * CLI context for dependency injection
 */
interface CLIContext {
    registry: MockRegistry;
    pm: MockPackageManager;
    fs: MockFS;
    stdout: (text: string) => void;
    stderr: (text: string) => void;
    exit: (code: number) => void;
    cwd: string;
}
/**
 * CLI instance type
 */
export interface CLIInstance {
    name: string;
    parse: (argv?: string[], options?: {
        run?: boolean;
    }) => {
        args: readonly string[];
        options: Record<string, unknown>;
    };
    commands: string[];
    cli: CAC;
}
/**
 * Create and return the CLI instance with all commands registered
 */
export declare function createCLI(): CLIInstance;
/**
 * Execute a CLI command with the given arguments and context
 */
export declare function runCLI(args: string[], context: CLIContext): Promise<CommandResult>;
//# sourceMappingURL=index.d.ts.map