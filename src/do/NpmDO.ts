/**
 * NpmDO - Durable Object for npm/npx operations
 *
 * Provides a stateful package management environment per namespace with:
 * - Package installation and resolution
 * - npx binary execution via esm.sh
 * - Cached package metadata and tarballs
 *
 * @module npmx/do/NpmDO
 */

import { DurableObject } from 'cloudflare:workers'
import type { Env } from './worker.js'

/**
 * Package metadata from registry
 */
export interface PackageMetadata {
  name: string
  version: string
  description?: string
  main?: string
  bin?: Record<string, string> | string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

/**
 * Install result
 */
export interface InstallResult {
  installed: Array<{ name: string; version: string }>
  resolved: number
  cached: number
  duration: number
}

/**
 * Execution result from npx
 */
export interface ExecResult {
  exitCode: number
  stdout: string
  stderr: string
  duration: number
}

/**
 * NpmDO - Durable Object for npm/npx operations
 *
 * Each instance represents a package management context (like a project directory).
 * State is persisted across requests.
 */
export class NpmDO extends DurableObject<Env> {
  /** In-memory cache of resolved packages */
  private packageCache: Map<string, PackageMetadata> = new Map()

  /** Registry URL */
  private registry: string = 'https://registry.npmjs.org'

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
  }

  // ============================================================================
  // PACKAGE METADATA
  // ============================================================================

  /**
   * Fetch package metadata from registry
   */
  async getPackageMetadata(name: string, version?: string): Promise<PackageMetadata> {
    const cacheKey = version ? `${name}@${version}` : name

    // Check cache first
    const cached = this.packageCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from registry
    const url = version
      ? `${this.registry}/${name}/${version}`
      : `${this.registry}/${name}/latest`

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw Object.assign(new Error(`Package not found: ${name}`), {
        code: 'ENOTFOUND',
        status: response.status,
      })
    }

    const metadata = (await response.json()) as PackageMetadata

    // Cache the result
    this.packageCache.set(cacheKey, metadata)

    return metadata
  }

  /**
   * Search packages in registry
   */
  async search(query: string, limit = 20): Promise<Array<{ name: string; version: string; description?: string | undefined }>> {
    const url = `${this.registry}/-/v1/search?text=${encodeURIComponent(query)}&size=${limit}`

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`)
    }

    const data = (await response.json()) as {
      objects: Array<{
        package: { name: string; version: string; description?: string }
      }>
    }

    return data.objects.map((obj) => {
      const result: { name: string; version: string; description?: string | undefined } = {
        name: obj.package.name,
        version: obj.package.version,
      }
      if (obj.package.description !== undefined) {
        result.description = obj.package.description
      }
      return result
    })
  }

  // ============================================================================
  // PACKAGE INSTALLATION
  // ============================================================================

  /**
   * Install packages to the virtual node_modules
   *
   * Uses fsx.do for filesystem operations and stores package contents
   */
  async install(
    packages: Array<{ name: string; version?: string }>,
    _options?: { dev?: boolean; exact?: boolean }
  ): Promise<InstallResult> {
    const start = Date.now()
    const installed: Array<{ name: string; version: string }> = []
    let resolved = 0
    let cached = 0

    for (const pkg of packages) {
      try {
        // Resolve package metadata
        const metadata = await this.getPackageMetadata(pkg.name, pkg.version)
        resolved++

        // Check if already installed via fsx
        const installedVersion = await this.getInstalledVersion(pkg.name)
        if (installedVersion === metadata.version) {
          cached++
          continue
        }

        // Download and extract tarball via fsx
        await this.downloadAndExtract(metadata)

        installed.push({ name: metadata.name, version: metadata.version })
      } catch (error) {
        console.error(`Failed to install ${pkg.name}:`, error)
        throw error
      }
    }

    return {
      installed,
      resolved,
      cached,
      duration: Date.now() - start,
    }
  }

  /**
   * Get the installed version of a package
   */
  private async getInstalledVersion(name: string): Promise<string | null> {
    if (!this.env.FSX) return null

    try {
      const response = await this.env.FSX.fetch('https://fsx.do/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'readFile',
          params: { path: `/node_modules/${name}/package.json`, encoding: 'utf-8' },
        }),
      })

      if (!response.ok) return null

      const result = (await response.json()) as { data: string }
      const pkg = JSON.parse(result.data) as { version: string }
      return pkg.version
    } catch {
      return null
    }
  }

  /**
   * Download and extract a package tarball
   */
  private async downloadAndExtract(metadata: PackageMetadata): Promise<void> {
    // Get tarball URL from registry
    const registryMeta = (await this.fetchPackageJson(metadata.name, metadata.version)) as {
      dist: { tarball: string }
    }

    const tarballUrl = registryMeta.dist.tarball

    // Fetch tarball
    const tarballResponse = await fetch(tarballUrl)
    if (!tarballResponse.ok) {
      throw new Error(`Failed to download tarball: ${tarballResponse.statusText}`)
    }

    const tarballBuffer = await tarballResponse.arrayBuffer()

    // Use fsx to extract - fsx handles the decompression and extraction
    if (this.env.FSX) {
      await this.env.FSX.fetch('https://fsx.do/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'extractTarball',
          params: {
            data: Array.from(new Uint8Array(tarballBuffer)),
            dest: `/node_modules/${metadata.name}`,
          },
        }),
      })
    }
  }

  /**
   * Fetch raw package.json from registry (includes dist info)
   */
  private async fetchPackageJson(name: string, version: string): Promise<unknown> {
    const url = `${this.registry}/${name}/${version}`
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    })
    return response.json()
  }

  // ============================================================================
  // NPX EXECUTION
  // ============================================================================

  /**
   * Execute a package binary (npx-style)
   *
   * For Tier 1 packages (pure ESM), uses esm.sh + dynamic import
   * For Tier 2+ packages, delegates to bashx
   */
  async exec(command: string, args: string[] = [], options?: { env?: Record<string, string> }): Promise<ExecResult> {
    const start = Date.now()

    try {
      // Resolve the command to a package
      const { packageName, binPath } = await this.resolveCommand(command)

      // Try esm.sh first (Tier 1)
      const esmResult = await this.execViaEsmSh(packageName, binPath, args, options)
      if (esmResult) {
        return {
          ...esmResult,
          duration: Date.now() - start,
        }
      }

      // Fall back to bashx (Tier 2+)
      if (this.env.BASHX) {
        const bashResult = await this.execViaBashx(command, args, options)
        return {
          ...bashResult,
          duration: Date.now() - start,
        }
      }

      throw new Error(`Cannot execute ${command}: no execution runtime available`)
    } catch (error) {
      const err = error as Error
      return {
        exitCode: 1,
        stdout: '',
        stderr: err.message,
        duration: Date.now() - start,
      }
    }
  }

  /**
   * Resolve a command to its package and binary path
   */
  private async resolveCommand(command: string): Promise<{ packageName: string; binPath: string }> {
    const packageName = command

    // Get package metadata to find bin
    const metadata = await this.getPackageMetadata(packageName)

    let binPath: string
    if (typeof metadata.bin === 'string') {
      binPath = metadata.bin
    } else if (metadata.bin && typeof metadata.bin === 'object') {
      // Use the command name or the package name as the bin key
      const binKey = command.split('/').pop() ?? command
      const binValue = metadata.bin[binKey] ?? Object.values(metadata.bin)[0]
      binPath = binValue ?? 'index.js'
    } else if (metadata.main) {
      binPath = metadata.main
    } else {
      binPath = 'index.js'
    }

    return { packageName, binPath }
  }

  /**
   * Execute via esm.sh (for pure ESM packages)
   */
  private async execViaEsmSh(
    packageName: string,
    _binPath: string,
    args: string[],
    options?: { env?: Record<string, string> }
  ): Promise<{ exitCode: number; stdout: string; stderr: string } | null> {
    // Build esm.sh URL
    const esmUrl = `https://esm.sh/${packageName}?target=es2022`

    try {
      // Dynamic import from esm.sh
      const module = await import(/* @vite-ignore */ esmUrl) as {
        default?: (args: string[], options?: { env?: Record<string, string> }) => unknown | Promise<unknown>
        run?: (args: string[], options?: { env?: Record<string, string> }) => unknown | Promise<unknown>
        main?: (args: string[], options?: { env?: Record<string, string> }) => unknown | Promise<unknown>
      }

      // Look for common entry points
      const entryPoint = module.default || module.run || module.main

      if (typeof entryPoint === 'function') {
        const result = await entryPoint(args, options)
        return {
          exitCode: 0,
          stdout: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
          stderr: '',
        }
      }

      // Module loaded but no runnable entry point
      return null
    } catch {
      // esm.sh failed, fall back to other methods
      return null
    }
  }

  /**
   * Execute via bashx (for Tier 2+ packages)
   */
  private async execViaBashx(
    command: string,
    args: string[],
    options?: { env?: Record<string, string> }
  ): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    const response = await this.env.BASHX!.fetch('https://bashx.do/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'exec',
        params: {
          command: 'npx',
          args: [command, ...args],
          options: { env: options?.env },
        },
      }),
    })

    if (!response.ok) {
      const error = (await response.json()) as { message?: string }
      return {
        exitCode: 1,
        stdout: '',
        stderr: error.message || 'Execution failed',
      }
    }

    return response.json() as Promise<{ exitCode: number; stdout: string; stderr: string }>
  }

  // ============================================================================
  // SCRIPT RUNNING
  // ============================================================================

  /**
   * Run a package.json script
   */
  async runScript(
    script: string,
    args: string[] = [],
    options?: { env?: Record<string, string> }
  ): Promise<ExecResult> {
    const start = Date.now()

    // Read package.json to get scripts
    if (!this.env.FSX) {
      return {
        exitCode: 1,
        stdout: '',
        stderr: 'FSX service not available',
        duration: Date.now() - start,
      }
    }

    try {
      const response = await this.env.FSX.fetch('https://fsx.do/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'readFile',
          params: { path: '/package.json', encoding: 'utf-8' },
        }),
      })

      if (!response.ok) {
        return {
          exitCode: 1,
          stdout: '',
          stderr: 'package.json not found',
          duration: Date.now() - start,
        }
      }

      const result = (await response.json()) as { data: string }
      const pkg = JSON.parse(result.data) as { scripts?: Record<string, string> }

      const scriptCommand = pkg.scripts?.[script]
      if (!scriptCommand) {
        return {
          exitCode: 1,
          stdout: '',
          stderr: `Script "${script}" not found in package.json`,
          duration: Date.now() - start,
        }
      }

      // Execute via bashx
      if (!this.env.BASHX) {
        return {
          exitCode: 1,
          stdout: '',
          stderr: 'BASHX service not available',
          duration: Date.now() - start,
        }
      }

      const bashResponse = await this.env.BASHX.fetch('https://bashx.do/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'run',
          params: {
            script: `${scriptCommand} ${args.join(' ')}`.trim(),
            options: { env: options?.env },
          },
        }),
      })

      const bashResult = (await bashResponse.json()) as { stdout?: string; stderr?: string; exitCode?: number }

      return {
        exitCode: bashResult.exitCode ?? 0,
        stdout: bashResult.stdout ?? '',
        stderr: bashResult.stderr ?? '',
        duration: Date.now() - start,
      }
    } catch (error) {
      const err = error as Error
      return {
        exitCode: 1,
        stdout: '',
        stderr: err.message,
        duration: Date.now() - start,
      }
    }
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  /**
   * List installed packages
   */
  async listInstalled(): Promise<Array<{ name: string; version: string }>> {
    if (!this.env.FSX) return []

    try {
      const response = await this.env.FSX.fetch('https://fsx.do/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'readdir',
          params: { path: '/node_modules', withFileTypes: true },
        }),
      })

      if (!response.ok) return []

      const result = (await response.json()) as {
        entries: Array<{ name: string; type: string }>
      }

      const packages: Array<{ name: string; version: string }> = []

      for (const entry of result.entries) {
        if (entry.type === 'directory' && !entry.name.startsWith('.')) {
          const version = await this.getInstalledVersion(entry.name)
          if (version) {
            packages.push({ name: entry.name, version })
          }
        }
      }

      return packages
    } catch {
      return []
    }
  }

  /**
   * Clear package cache
   */
  clearCache(): void {
    this.packageCache.clear()
  }
}
