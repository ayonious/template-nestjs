import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

// @Injectable() marks this class as a provider that Nest can supply to other classes.
// This service acts as the app's data store; a database could replace its internals later.
@Injectable()
export class CacheService {
  // @Inject selects the cache provider registered by CacheModule using its token.
  // Nest supplies the shared third-party cache instance instead of us creating one.
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async save(data: Record<string, unknown>) {
    // One key preserves the latest-value behavior. TTL 0 means no automatic expiry.
    await this.cache.set('data', data, 0);
    return data;
  }

  async get() {
    // Cache reads are asynchronous so the store could also be backed by Redis later.
    // Convert a missing entry to null to preserve the empty GET response.
    return (await this.cache.get<Record<string, unknown>>('data')) ?? null;
  }
}
