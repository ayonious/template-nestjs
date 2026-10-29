import { ApiTags, ApiOperation, ApiOkResponse, ApiQuery, ApiNotFoundResponse, ApiBadRequestResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { ApiError, User, Sale } from './models.js';
import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { LimitPipe } from './limit.pipe.js';
import { DataService } from './data.service.js';

// A separate controller exposes the sales collection for a user.
// Swagger decorators describe these routes in the interactive API documentation.
@ApiTags('sales')
@ApiInternalServerErrorResponse({ type: ApiError, description: 'Unexpected failure; internal details are hidden.' })
@Controller('sales')
export class SalesController {
  // Constructor injection shares DataService instead of creating a second store.
  constructor(private readonly data: DataService) {}

  // @Get() without a path lists /sales. @Query reads the optional ?limit= value.
  // The pipe validates it before this handler runs; Nest serializes the result as JSON.
  @ApiOperation({ summary: 'List all sales' })
  @ApiOkResponse({ type: Sale, isArray: true })
  @ApiQuery({ name: 'limit', required: false, schema: { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER }, description: 'Maximum records; omit for all, 0 for none.' })
  @ApiBadRequestResponse({ type: ApiError, description: 'Invalid limit', example: { statusCode: 400, message: 'limit must be a non-negative safe integer', path: '/sales?limit=-1', timestamp: '2026-01-01T00:00:00.000Z' } })
  @Get()
  getAllSales(@Query('limit', LimitPipe) limit?: number) {
    return this.data.getAllSales(limit);
  }

  // Here the path segment is a USER ID, e.g. GET /sales/1 lists Alice's sales.
  @ApiOperation({ summary: 'List sales belonging to a user' })
  @ApiOkResponse({ type: Sale, isArray: true })
  @ApiNotFoundResponse({ type: ApiError, description: 'User not found' })
  @Get(':userId')
  getSales(@Param('userId') userId: string) {
    if (!this.data.getUser(userId)) throw new NotFoundException('User not found');
    // Nest serializes the returned array (including []) as JSON with status 200.
    return this.data.getSales(userId);
  }
}
