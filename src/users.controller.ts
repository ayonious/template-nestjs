import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { LimitPipe } from './limit.pipe.js';
import { DataService } from './data.service.js';

// This prefix applies to both the user route and its nested sale route.
@Controller('users')
export class UsersController {
  // Nest injects the same registered storage provider used by SalesController.
  constructor(private readonly data: DataService) {}

  // @Get() without a path lists /users. @Query reads the optional ?limit= value.
  // The pipe validates it before this handler runs; Nest serializes the result as JSON.
  @Get()
  getUsers(@Query('limit', LimitPipe) limit?: number) {
    return this.data.getUsers(limit);
  }

  // :userId is a variable path segment. @Param reads it as a string.
  @Get(':userId')
  getUser(@Param('userId') userId: string) {
    const user = this.data.getUser(userId);
    // Nest converts this exception into an HTTP 404 JSON response.
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Both parameters come from the URL, e.g. /users/1/sales/101.
  @Get(':userId/sales/:saleId')
  getSale(@Param('userId') userId: string, @Param('saleId') saleId: string) {
    const sale = this.data.getSale(userId, saleId);
    if (!sale) throw new NotFoundException('Sale not found for this user');
    // Nest serializes the returned record as JSON with status 200.
    return sale;
  }
}
