import NodeCache from 'node-cache';
import redis from 'redis'

interface CacheProvider {
    get<T>(key: string): any | Promise<T | null>;
    set(key: string, value: any): void | Promise<boolean>;
    del(key: string): void | Promise<boolean>;
}

export class RedisProvider implements CacheProvider {
    private client: redis.RedisClientType

    constructor(option: redis.RedisClusterOptions) {
        this.client = redis.createClient(option);
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const result = await this.client.get(key) as T | null

            return result
        } catch {
            return null
        }
    }

    async set(key: string, value: any): Promise<boolean> {
        try {
            await this.client.set(key, value)

            return true
        } catch {
            return false
        }
    }

    async del(key: string): Promise<boolean> {
        try {
            await this.client.del(key)

            return true
        } catch {
            return false
        }
    }
}

export class NodeCacheProvider implements CacheProvider {
    private client: NodeCache

    constructor(option: NodeCache.Options) {
        this.client = new NodeCache(option)
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const result = await this.client.get(key) as T | null

            return result
        } catch {
            return null
        }
    }

    async set(key: string, value: any): Promise<boolean> {
        try {
            await this.client.set(key, value)

            return true
        } catch {
            return false
        }
    }

    async del(key: string): Promise<boolean> {
        try {
            await this.client.del(key)

            return true
        } catch {
            return false
        }
    }
}