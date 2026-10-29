import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { DataService } from './data.service.js';

// A separate controller exposes the sales collection for a user.
@Controller('sales')
export class SalesController {
  // Constructor injection shares DataService instead of creating a second store.
  constructor(private readonly data: DataService) {}

  // Here the path segment is a USER ID, e.g. GET /sales/1 lists Alice's sales.
  @Get(':userId')
  getSales(@Param('userId') userId: string) {
    if (!this.data.getUser(userId)) throw new NotFoundException('User not found');
    // Nest serializes the returned array (including []) as JSON with status 200.
    return this.data.getSales(userId);
  }
}
