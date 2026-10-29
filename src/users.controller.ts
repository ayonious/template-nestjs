import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CacheService } from './cache.service.js';

// This prefix applies to both the user route and its nested sale route.
@Controller('users')
export class UsersController {
  // Nest injects the same registered storage provider used by SalesController.
  constructor(private readonly cache: CacheService) {}

  // :userId is a variable path segment. @Param reads it as a string.
  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    const user = await this.cache.getUser(userId);
    // Nest converts this exception into an HTTP 404 JSON response.
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Both parameters come from the URL, e.g. /users/1/sales/101.
  @Get(':userId/sales/:saleId')
  async getSale(@Param('userId') userId: string, @Param('saleId') saleId: string) {
    const sale = await this.cache.getSale(userId, saleId);
    if (!sale) throw new NotFoundException('Sale not found for this user');
    // Nest serializes the returned record as JSON with status 200.
    return sale;
  }
}
