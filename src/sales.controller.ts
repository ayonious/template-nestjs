import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CacheService } from './cache.service.js';

// A separate controller exposes the sales collection for a user.
@Controller('sales')
export class SalesController {
  // Constructor injection shares CacheService instead of creating a second store.
  constructor(private readonly cache: CacheService) {}

  // Here the path segment is a USER ID, e.g. GET /sales/1 lists Alice's sales.
  @Get(':userId')
  async getSales(@Param('userId') userId: string) {
    if (!await this.cache.getUser(userId)) throw new NotFoundException('User not found');
    // Nest awaits this promise and returns a JSON array (including []), status 200.
    return this.cache.getSales(userId);
  }
}
