/**
 * Output formatting utilities for CLI
 */
/**
 * Format package list output
 */
export function formatPackageList(packages, options) {
    if (options?.json) {
        return JSON.stringify(packages, null, 2);
    }
    if (packages.length === 0) {
        return '(empty)';
    }
    if (options?.long) {
        return packages
            .map((p) => {
            const dev = p.dev ? ' (dev)' : '';
            const desc = p.description ? ` - ${p.description}` : '';
            return `${p.name}@${p.version}${dev}${desc}`;
        })
            .join('\n');
    }
    return packages.map((p) => `${p.name}@${p.version}`).join('\n');
}
/**
 * Format search results
 */
export function formatSearchResults(results, options) {
    if (options?.json) {
        return JSON.stringify(results, null, 2);
    }
    if (results.length === 0) {
        return 'No packages found';
    }
    return results
        .map((r) => {
        const desc = r.description ? ` - ${r.description}` : '';
        return `${r.name}@${r.version}${desc}`;
    })
        .join('\n');
}
/**
 * Format package info
 */
export function formatPackageInfo(pkg, options) {
    if (options?.json) {
        return JSON.stringify(pkg, null, 2);
    }
    const lines = [];
    lines.push(`${pkg.name}@${pkg.version}`);
    if (pkg.description) {
        lines.push(`  ${pkg.description}`);
    }
    if (pkg.homepage) {
        lines.push(`  homepage: ${pkg.homepage}`);
    }
    if (pkg.repository) {
        lines.push(`  repository: ${pkg.repository}`);
    }
    if (pkg.license) {
        lines.push(`  license: ${pkg.license}`);
    }
    if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
        lines.push(`  dependencies:`);
        for (const [name, version] of Object.entries(pkg.dependencies)) {
            lines.push(`    ${name}: ${version}`);
        }
    }
    if (pkg.devDependencies && Object.keys(pkg.devDependencies).length > 0) {
        lines.push(`  devDependencies:`);
        for (const [name, version] of Object.entries(pkg.devDependencies)) {
            lines.push(`    ${name}: ${version}`);
        }
    }
    return lines.join('\n');
}
/**
 * Format install result
 */
export function formatInstallResult(installed, removed, updated) {
    const lines = [];
    if (installed.length > 0) {
        lines.push(`added ${installed.length} packages`);
    }
    if (removed.length > 0) {
        lines.push(`removed ${removed.length} packages`);
    }
    if (updated.length > 0) {
        lines.push(`updated ${updated.length} packages`);
    }
    if (lines.length === 0) {
        return 'up to date';
    }
    return lines.join(', ');
}
/**
 * Format bytes to human readable
 */
export function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
//# sourceMappingURL=format.js.map