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
export class LRUCache {
    cache = new Map();
    head = null; // Most recently used
    tail = null; // Least recently used
    _maxSize;
    _hits = 0;
    _misses = 0;
    _evictions = 0;
    _onEvict;
    /**
     * Creates a new LRU cache.
     *
     * @param options - Configuration options
     */
    constructor(options) {
        this._maxSize = options?.maxSize ?? 100;
        this._onEvict = options?.onEvict ?? undefined;
    }
    /**
     * Gets the current number of entries in the cache.
     */
    get size() {
        return this.cache.size;
    }
    /**
     * Gets a value from the cache.
     * Moves the entry to the most recently used position.
     *
     * @param key - The cache key
     * @returns The cached value or undefined if not found
     */
    get(key) {
        const node = this.cache.get(key);
        if (!node) {
            this._misses++;
            return undefined;
        }
        // Move to head (most recently used)
        this.moveToHead(node);
        this._hits++;
        return node.value;
    }
    /**
     * Sets a value in the cache.
     * If the key exists, updates the value and moves to MRU.
     * If at capacity, evicts the LRU entry first.
     *
     * @param key - The cache key
     * @param value - The value to cache
     */
    set(key, value) {
        const existingNode = this.cache.get(key);
        if (existingNode) {
            // Update existing entry
            existingNode.value = value;
            this.moveToHead(existingNode);
            return;
        }
        // Evict if at capacity
        if (this.cache.size >= this._maxSize) {
            this.evictLRU();
        }
        // Create new node
        const node = {
            key,
            value,
            prev: null,
            next: null,
        };
        this.cache.set(key, node);
        this.addToHead(node);
    }
    /**
     * Deletes an entry from the cache.
     *
     * @param key - The cache key
     * @returns true if the entry was deleted, false if not found
     */
    delete(key) {
        const node = this.cache.get(key);
        if (!node) {
            return false;
        }
        this.removeNode(node);
        this.cache.delete(key);
        if (this._onEvict) {
            this._onEvict(key, node.value);
        }
        return true;
    }
    /**
     * Checks if a key exists in the cache.
     * Does NOT update LRU order.
     *
     * @param key - The cache key
     * @returns true if the key exists
     */
    has(key) {
        return this.cache.has(key);
    }
    /**
     * Gets a value without updating LRU order.
     * Useful for inspection without affecting eviction priority.
     *
     * @param key - The cache key
     * @returns The cached value or undefined if not found
     */
    peek(key) {
        const node = this.cache.get(key);
        return node?.value;
    }
    /**
     * Clears all entries from the cache.
     * Calls onEvict for each entry if configured.
     */
    clear() {
        if (this._onEvict) {
            for (const [key, node] of this.cache) {
                this._onEvict(key, node.value);
            }
        }
        this.cache.clear();
        this.head = null;
        this.tail = null;
    }
    /**
     * Gets all keys in LRU order (most recently used first).
     *
     * @returns Array of keys from MRU to LRU
     */
    keys() {
        const keys = [];
        let node = this.head;
        while (node) {
            keys.push(node.key);
            node = node.next;
        }
        return keys;
    }
    /**
     * Resizes the cache to a new maximum size.
     * Evicts LRU entries if current size exceeds new limit.
     *
     * @param newMaxSize - The new maximum size
     */
    resize(newMaxSize) {
        this._maxSize = newMaxSize;
        // Evict until we're at the new limit
        while (this.cache.size > newMaxSize) {
            this.evictLRU();
        }
    }
    /**
     * Gets cache statistics.
     *
     * @returns Current cache statistics
     */
    getStats() {
        const total = this._hits + this._misses;
        const hitRate = total === 0 ? 0 : Math.round((this._hits / total) * 100);
        return {
            hits: this._hits,
            misses: this._misses,
            evictions: this._evictions,
            count: this.cache.size,
            hitRate,
        };
    }
    /**
     * Resets statistics without clearing cached data.
     */
    resetStats() {
        this._hits = 0;
        this._misses = 0;
        this._evictions = 0;
    }
    // ============================================
    // Private Methods - Linked List Operations
    // ============================================
    /**
     * Moves a node to the head (most recently used).
     */
    moveToHead(node) {
        if (node === this.head) {
            return;
        }
        this.removeNode(node);
        this.addToHead(node);
    }
    /**
     * Adds a node to the head of the list.
     */
    addToHead(node) {
        node.prev = null;
        node.next = this.head;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
            this.tail = node;
        }
    }
    /**
     * Removes a node from the linked list.
     */
    removeNode(node) {
        if (node.prev) {
            node.prev.next = node.next;
        }
        else {
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        }
        else {
            this.tail = node.prev;
        }
        node.prev = null;
        node.next = null;
    }
    /**
     * Evicts the least recently used entry.
     */
    evictLRU() {
        if (!this.tail) {
            return;
        }
        const lru = this.tail;
        this.removeNode(lru);
        this.cache.delete(lru.key);
        this._evictions++;
        if (this._onEvict) {
            this._onEvict(lru.key, lru.value);
        }
    }
}
//# sourceMappingURL=lru.js.map