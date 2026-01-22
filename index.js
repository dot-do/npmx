/**
 * npmx.do - NPM/NPX for Edge Runtimes
 *
 * Package management that works in Cloudflare Workers, Deno, browsers,
 * and any V8 isolate. Zero cold starts, no Node.js required.
 *
 * @example
 * ```typescript
 * import { npm, npx } from 'npmx.do'
 *
 * // Install packages at runtime
 * await npm.install(['lodash', 'react@18'])
 *
 * // Run npx commands
 * await npx('cowsay', ['hello'])
 * ```
 *
 * @example CLI
 * ```bash
 * npx npmx.do install lodash
 * npx npmx.do info react
 * npx npmx.do search "state management"
 * ```
 *
 * @packageDocumentation
 */
// =============================================================================
// Re-export core @dotdo/npmx
// =============================================================================
export * from './core/index.js';
// =============================================================================
// CLI exports
// =============================================================================
export { createCLI, runCLI, formatPackageList, formatSearchResults, formatPackageInfo, formatInstallResult, } from './cli/index.js';
export { createEmptyInstallResult } from './types.js';
/**
 * Create an npm SDK instance
 *
 * @experimental This API returns placeholder data. Full implementation pending.
 * All methods return empty arrays or stub values. Use the core/ modules
 * directly for actual package operations until this SDK is fully implemented.
 *
 * @param config - Configuration options
 * @returns An npm SDK instance with placeholder methods
 *
 * @example
 * ```typescript
 * import { createNpm } from 'npmx.do'
 *
 * const npm = createNpm({ cwd: '/app' })
 * await npm.install(['lodash', 'express'])
 * await npm.run('build')
 * ```
 */
export function createNpm(config = {}) {
    // @experimental - Placeholder implementation
    // TODO: Wire up to core/ modules (resolver, tarball, package)
    void config; // Acknowledge config param for future use
    return {
        install: async () => ({
            installed: [],
            removed: [],
            updated: [],
            stats: {
                resolved: 0,
                cached: 0,
                duration: 0,
            },
        }),
        uninstall: async () => { },
        run: async () => ({ exitCode: 0, output: '' }),
        list: async () => [],
        search: async () => [],
        info: async (name) => ({ name, version: '0.0.0' }),
    };
}
/**
 * Execute a package binary (npx-style)
 *
 * @experimental This API returns placeholder data. Full implementation pending.
 * Currently returns an empty success result without executing any command.
 * Use bashx.do for actual command execution until this is fully implemented.
 *
 * @param command - Command/package to run
 * @param args - Arguments to pass
 * @param options - Execution options
 *
 * @example
 * ```typescript
 * import { npx } from 'npmx.do'
 *
 * // Run cowsay
 * await npx('cowsay', ['hello'])
 *
 * // Create a Next.js app
 * await npx('create-next-app', ['my-app'])
 * ```
 */
export async function npx(command, args = [], options = {}) {
    // @experimental - Placeholder implementation
    // TODO: Implement package download, caching, and execution via bashx
    void command;
    void args;
    void options;
    return { exitCode: 0, output: '' };
}
/**
 * Default npm SDK singleton
 *
 * @experimental This API returns placeholder data. See {@link createNpm} for details.
 * All methods return empty arrays or stub values until fully implemented.
 *
 * @example
 * ```typescript
 * import { npm } from 'npmx.do'
 *
 * await npm.install(['lodash'])
 * const packages = await npm.list()
 * ```
 */
export const npm = createNpm();
//# sourceMappingURL=index.js.map