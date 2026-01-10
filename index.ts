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

export * from './core/index.js'

// =============================================================================
// CLI exports
// =============================================================================

export {
  createCLI,
  runCLI,
  formatPackageList,
  formatSearchResults,
  formatPackageInfo,
  formatInstallResult,
} from './cli/index.js'

export type {
  CommandResult,
  PackageEntry,
  SearchResult,
  ListFormatOptions,
  InstallOptions,
} from './cli/types.js'

// =============================================================================
// Service Definition (for dotdo integration)
// =============================================================================

// import { createService } from 'dotdo'
// import App from './App.js'
// import Site from './Site.js'
//
// export default createService({
//   name: 'npmx',
//   App,
//   Site,
//   docs: import.meta.glob('./docs/*.mdx'),
// })

// =============================================================================
// npm/npx factories for SDK usage
// =============================================================================

/**
 * Configuration options for the npm SDK
 */
export interface NpmConfig {
  /** Working directory for operations */
  cwd?: string
  /** Custom registry URL */
  registry?: string
  /** Authentication token */
  token?: string
}

/**
 * Install result type
 */
export interface InstallResult {
  added: Array<{ name: string; version: string }>
  removed: Array<{ name: string; version: string }>
  updated: Array<{ name: string; from: string; to: string }>
}

/**
 * npm SDK interface
 */
export interface NpmSDK {
  /**
   * Install packages
   * @param packages - Package specs to install (e.g., ['lodash', 'react@18'])
   * @param options - Install options
   */
  install: (packages?: string[], options?: { dev?: boolean; exact?: boolean }) => Promise<InstallResult>

  /**
   * Uninstall packages
   * @param packages - Package names to remove
   */
  uninstall: (packages: string[]) => Promise<void>

  /**
   * Run a package.json script
   * @param script - Script name
   * @param args - Arguments to pass to the script
   */
  run: (script: string, args?: string[]) => Promise<{ exitCode: number; output: string }>

  /**
   * List installed packages
   * @param options - List options
   */
  list: (options?: { depth?: number }) => Promise<Array<{ name: string; version: string }>>

  /**
   * Search the registry
   * @param query - Search query
   */
  search: (query: string) => Promise<Array<{ name: string; version: string; description?: string }>>

  /**
   * Get package info
   * @param name - Package name
   * @param version - Optional version
   */
  info: (name: string, version?: string) => Promise<{
    name: string
    version: string
    description?: string
    dependencies?: Record<string, string>
  }>
}

/**
 * Create an npm SDK instance
 *
 * @param config - Configuration options
 * @returns An npm SDK instance
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
export function createNpm(_config: NpmConfig = {}): NpmSDK {
  // Placeholder implementation - actual implementation would use core modules
  return {
    install: async (_packages, _options) => ({
      added: [],
      removed: [],
      updated: [],
    }),
    uninstall: async () => {},
    run: async () => ({ exitCode: 0, output: '' }),
    list: async () => [],
    search: async () => [],
    info: async (name) => ({ name, version: '0.0.0' }),
  }
}

/**
 * Execute a package binary (npx-style)
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
export async function npx(
  _command: string,
  _args: string[] = [],
  _options: NpmConfig = {}
): Promise<{ exitCode: number; output: string }> {
  // Placeholder implementation
  return { exitCode: 0, output: '' }
}

/**
 * Default npm SDK singleton
 *
 * @example
 * ```typescript
 * import { npm } from 'npmx.do'
 *
 * await npm.install(['lodash'])
 * const packages = await npm.list()
 * ```
 */
export const npm: NpmSDK = createNpm()
