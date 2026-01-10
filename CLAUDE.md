# npmx.do - NPM/NPX for Edge Runtimes

## What is npmx?

Edge-native package management - run `npm install` and `npx` commands without Node.js. Uses fsx.do for all filesystem operations (fsx handles tiered storage automatically).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        npmx.do                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Registry   │  │  Resolver   │  │      Runner         │ │
│  │  - fetch    │  │  - semver   │  │  - npm run          │ │
│  │  - metadata │  │  - tree     │  │  - npx exec         │ │
│  │  - extract  │  │  - lockfile │  │  - scripts          │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼────────────────────┼────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                        fsx.do                               │
│         (handles all storage - SQLite hot, R2 cold)         │
│                                                             │
│   /node_modules/lodash/...     → SQLite (frequently used)   │
│   /cache/lodash-4.17.21.tgz    → R2 (large, cold)          │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. fsx.do Handles All Storage
- npmx writes to fsx like a normal filesystem
- fsx auto-tiers: small/hot files → SQLite, large/cold → R2
- No R2 logic in npmx - clean separation of concerns
- Deduplication handled by fsx content-addressable storage

### 2. ESM-First Package Loading
- Use esm.sh/skypack for ESM-compatible packages (no install needed)
- Dynamic import() instead of require() where possible
- Fall back to full extraction for complex packages

### 3. Dependency Resolution
- Full semver resolution like npm
- Lock file support (package-lock.json)
- Workspace/monorepo support

### 4. Script Execution
- Parse package.json scripts
- Environment variable injection
- PATH includes node_modules/.bin
- Integration with bashx.do

## Commands

```bash
# Package installation
npm install lodash
npm install lodash@4.17.21
npm install -D vitest

# Script running
npm run build
npm run test -- --watch
npm start

# Direct execution
npx cowsay hello
npx create-next-app@latest my-app
npx -p typescript tsc --init

# Publishing (future)
npm publish
npm version patch
```

## Integration with bashx

bashx routes npm/npx commands to npmx.do:

```typescript
// In bashx tiered-executor
case 'npm':
case 'npx':
  return this.npmx.execute(command, args)
```

## Files

```
src/
├── index.ts           # Main exports
├── registry/          # npm registry client
│   ├── client.ts      # Registry API
│   ├── cache.ts       # R2 package cache
│   └── extract.ts     # Tarball extraction
├── resolver/          # Dependency resolution
│   ├── tree.ts        # Dependency tree builder
│   ├── semver.ts      # Version resolution
│   └── lockfile.ts    # Lock file handling
├── loader/            # Module loading
│   ├── esm.ts         # ESM loader
│   ├── cjs.ts         # CJS transformation
│   └── polyfills.ts   # Node.js polyfills
├── runner/            # Command execution
│   ├── npm.ts         # npm commands
│   ├── npx.ts         # npx execution
│   └── scripts.ts     # package.json scripts
└── commands/          # Individual command implementations
    ├── install.ts
    ├── run.ts
    ├── exec.ts
    └── publish.ts
```

## Testing

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run typecheck     # Type checking
```

## Issue Tracking

Uses **bd** (beads) for TDD workflow:
```bash
bd ready              # Find work
bd show <id>          # View details
bd update <id> --status in_progress
bd close <id>
bd sync
```
