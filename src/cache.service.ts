import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

// @Injectable() marks this class as a provider that Nest can supply to other classes.
// This service acts as the app's data store; a database could replace its internals later.
@Injectable()
export class CacheService implements OnModuleInit {
  // @Inject selects the cache provider registered by CacheModule using its token.
  // Nest supplies the shared third-party cache instance instead of us creating one.
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  // Nest calls this lifecycle hook once this provider's dependencies are ready,
  // before serving requests. Seed small collections so the GET routes work immediately.
  async onModuleInit() {
    await this.cache.set('users', [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' },
    ], 0);
    await this.cache.set('sales', [
      { id: '101', userId: '1', product: 'Notebook', amount: 12 },
      { id: '102', userId: '1', product: 'Pen', amount: 3 },
      { id: '103', userId: '2', product: 'Backpack', amount: 45 },
    ], 0);
  }

  async getUser(userId: string) {
    const users = (await this.cache.get<User[]>('users')) ?? [];
    return users.find((user) => user.id === userId) ?? null;
  }

  async getSales(userId: string) {
    const sales = (await this.cache.get<Sale[]>('sales')) ?? [];
    return sales.filter((sale) => sale.userId === userId);
  }

  async getSale(userId: string, saleId: string) {
    // Match both IDs so a user's nested route cannot return another user's sale.
    return (await this.getSales(userId)).find((sale) => sale.id === saleId) ?? null;
  }

  async save(data: Record<string, unknown>, resource: 'data' | 'notes' = 'data') {
    // Each resource has its own latest value. TTL 0 means no automatic expiry.
    await this.cache.set(resource, data, 0);
    return data;
  }

  async get(resource: 'data' | 'notes' = 'data') {
    // Cache reads are asynchronous so the store could also be backed by Redis later.
    // Convert a missing entry to null to preserve the empty GET response.
    return (await this.cache.get<Record<string, unknown>>(resource)) ?? null;
  }
}

// These types describe stored records; userId links each sale to its owner.
interface User {
  id: string;
  name: string;
}

interface Sale {
  id: string;
  userId: string;
  product: string;
  amount: number;
}
