/**
 * Package.json Normalization Functions
 *
 * Functions to normalize various package.json fields to canonical forms.
 * This module has ZERO Cloudflare dependencies.
 */
import type { NormalizedRepository, RepositoryField } from './types.js';
/**
 * Normalizes a repository field to a standard object format.
 *
 * Handles:
 * - GitHub shorthand: "user/repo" or "github:user/repo"
 * - GitLab shorthand: "gitlab:user/repo"
 * - Bitbucket shorthand: "bitbucket:user/repo"
 * - git:// URLs
 * - SSH URLs: git@github.com:user/repo.git
 * - Full repository objects
 */
export declare function normalizeRepository(repository: RepositoryField | undefined): NormalizedRepository | undefined;
/**
 * Normalizes a file path to start with "./"
 */
export declare function normalizePath(path: string): string;
/**
 * Normalizes keywords array:
 * - Lowercase
 * - Trim whitespace
 * - Remove duplicates
 * - Filter empty strings
 * - Filter non-strings
 */
export declare function normalizeKeywords(keywords: unknown[]): string[];
/**
 * Parses a person string into an object.
 * Format: "Name <email> (url)"
 */
export declare function parsePerson(person: string): {
    name: string;
    email?: string;
    url?: string;
};
//# sourceMappingURL=normalize.d.ts.map