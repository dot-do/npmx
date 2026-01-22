/**
 * LRU Cache Implementation for Package Metadata
 *
 * A bounded Least Recently Used (LRU) cache to prevent OOM in long-running DOs.
 * When the cache exceeds maxSize, the least recently used entries are evicted.
 *
 * Features:
 * - Configurable max size (default 100)
 * - O(1) get/set/delete operations using doubly linked list + Map
 * - LRU eviction policy (evicts least recently used on overflow)
 * - Statistics tracking (hits, misses, evictions, hit rate)
 * - Optional eviction callback
 *
 * @module core/cache/lru
 */
/**
 * Configuration options for the LRU cache.
 */
export interface CacheOptions<K = string, V = unknown> {
    /**
     * Maximum number of entries in the cache.
     * When exceeded, least recently used entries are evicted.
     * @default 100
     */
    maxSize?: number;
    /**
     * Callback invoked when an entry is evicted from the cache.
     * Useful for cleanup, logging, or metrics.
     */
    onEvict?: (key: K, value: V) => void;
}
/**
 * Cache statistics for monitoring and debugging.
 */
export interface CacheStats {
    /** Number of successful cache lookups */
    hits: number;
    /** Number of failed cache lookups */
    misses: number;
    /** Number of entries evicted due to size limits */
    evictions: number;
    /** Current number of entries in the cache */
    count: number;
    /** Hit rate as percentage (0-100) */
    hitRate: number;
}
/**
 * LRU Cache with bounded size and statistics tracking.
 *
 * Uses a combination of:
 * - Map for O(1) key lookup
 * - Doubly linked list for O(1) LRU ordering
 *
 * @example
 * ```typescript
 * const cache = new LRUCache<string, PackageMetadata>({ maxSize: 100 })
 *
 * cache.set('lodash@4.17.21', metadata)
 * const hit = cache.get('lodash@4.17.21')
 *
 * const stats = cache.getStats()
 * console.log(`Hit rate: ${stats.hitRate}%`)
 * ```
 */
export declare class LRUCache<K = string, V = unknown> {
    private cache;
    private head;
    private tail;
    private _maxSize;
    private _hits;
    private _misses;
    private _evictions;
    private _onEvict;
    /**
     * Creates a new LRU cache.
     *
     * @param options - Configuration options
     */
    constructor(options?: CacheOptions<K, V>);
    /**
     * Gets the current number of entries in the cache.
     */
    get size(): number;
    /**
     * Gets a value from the cache.
     * Moves the entry to the most recently used position.
     *
     * @param key - The cache key
     * @returns The cached value or undefined if not found
     */
    get(key: K): V | undefined;
    /**
     * Sets a value in the cache.
     * If the key exists, updates the value and moves to MRU.
     * If at capacity, evicts the LRU entry first.
     *
     * @param key - The cache key
     * @param value - The value to cache
     */
    set(key: K, value: V): void;
    /**
     * Deletes an entry from the cache.
     *
     * @param key - The cache key
     * @returns true if the entry was deleted, false if not found
     */
    delete(key: K): boolean;
    /**
     * Checks if a key exists in the cache.
     * Does NOT update LRU order.
     *
     * @param key - The cache key
     * @returns true if the key exists
     */
    has(key: K): boolean;
    /**
     * Gets a value without updating LRU order.
     * Useful for inspection without affecting eviction priority.
     *
     * @param key - The cache key
     * @returns The cached value or undefined if not found
     */
    peek(key: K): V | undefined;
    /**
     * Clears all entries from the cache.
     * Calls onEvict for each entry if configured.
     */
    clear(): void;
    /**
     * Gets all keys in LRU order (most recently used first).
     *
     * @returns Array of keys from MRU to LRU
     */
    keys(): K[];
    /**
     * Resizes the cache to a new maximum size.
     * Evicts LRU entries if current size exceeds new limit.
     *
     * @param newMaxSize - The new maximum size
     */
    resize(newMaxSize: number): void;
    /**
     * Gets cache statistics.
     *
     * @returns Current cache statistics
     */
    getStats(): CacheStats;
    /**
     * Resets statistics without clearing cached data.
     */
    resetStats(): void;
    /**
     * Moves a node to the head (most recently used).
     */
    private moveToHead;
    /**
     * Adds a node to the head of the list.
     */
    private addToHead;
    /**
     * Removes a node from the linked list.
     */
    private removeNode;
    /**
     * Evicts the least recently used entry.
     */
    private evictLRU;
}
//# sourceMappingURL=lru.d.ts.map