import { ApiTags, ApiOperation, ApiOkResponse, ApiQuery, ApiNotFoundResponse, ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiCreatedResponse, ApiBasicAuth, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { ApiError, User, Sale, CreateUserInput } from './models.js';
import { BadRequestException, Body, Controller, ForbiddenException, Get, Post, Req, UseGuards, NotFoundException, Param, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CredentialsService } from './credentials.service.js';
import { LimitPipe } from './limit.pipe.js';
import { DataService } from './data.service.js';

// This prefix applies to both the user route and its nested sale route.
// Swagger decorators describe these routes in the interactive API documentation.
@ApiTags('users')
@ApiInternalServerErrorResponse({ type: ApiError, description: 'Unexpected failure; internal details are hidden.' })
@Controller('users')
export class UsersController {
  // Nest injects the same registered storage provider used by SalesController.
  constructor(private readonly data: DataService, private readonly credentials: CredentialsService) {}

  @ApiOperation({ summary: 'Create a user with a chosen password' })
  @ApiCreatedResponse({ type: User })
  @ApiBadRequestResponse({ type: ApiError, description: 'Invalid name or password' })
  @Post()
  createUser(@Body() input: CreateUserInput) {
    // Nest provides parsed JSON; validate it before creating either record.
    if (!input || typeof input.name !== 'string' || !input.name.trim() || input.name.length > 100
      || typeof input.password !== 'string' || !input.password.trim() || input.password.length > 256) {
      throw new BadRequestException('name and password must be non-empty strings (max 100 and 256 characters)');
    }
    // The service creates a public user and a matching record in the password database.
    return this.credentials.createUser(input.name.trim(), input.password);
  }

  // @Get() without a path lists /users. @Query reads the optional ?limit= value.
  // The pipe validates it before this handler runs; Nest serializes the result as JSON.
  @ApiOperation({ summary: 'List users' })
  @ApiOkResponse({ type: User, isArray: true })
  @ApiQuery({ name: 'limit', required: false, schema: { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER }, description: 'Maximum records; omit for all, 0 for none.' })
  @ApiBadRequestResponse({ type: ApiError, description: 'Invalid limit', example: { statusCode: 400, message: 'limit must be a non-negative safe integer', path: '/users?limit=-1', timestamp: '2026-01-01T00:00:00.000Z' } })
  @Get()
  getUsers(@Query('limit', LimitPipe) limit?: number) {
    return this.data.getUsers(limit);
  }

  // :userId is a variable path segment. @Param reads it as a string.
  @ApiOperation({ summary: 'Get your user record with matching user ID and password' })
  @ApiBasicAuth()
  @ApiUnauthorizedResponse({ type: ApiError, description: 'Missing or invalid credentials' })
  @ApiForbiddenResponse({ type: ApiError, description: 'Credentials belong to a different user' })
  @UseGuards(AuthGuard('basic'))
  @ApiOkResponse({ type: User, isArray: false })
  @ApiNotFoundResponse({ type: ApiError, description: 'User not found' })
  @Get(':userId')
  getUser(@Param('userId') userId: string, @Req() request: { user: User }) {
    const user = this.data.getUser(userId);
    // Nest converts this exception into an HTTP 404 JSON response.
    if (!user) throw new NotFoundException('User not found');
    // Authentication checks the password; this check ties it to the requested user ID.
    if (request.user.id !== userId) throw new ForbiddenException('Cannot access another user');
    return user;
  }

  // Both parameters come from the URL, e.g. /users/1/sales/101.
  @ApiOperation({ summary: 'Get a sale belonging to a user' })
  @ApiOkResponse({ type: Sale })
  @ApiNotFoundResponse({ type: ApiError, description: 'Sale not found for this user' })
  @Get(':userId/sales/:saleId')
  getSale(@Param('userId') userId: string, @Param('saleId') saleId: string) {
    const sale = this.data.getSale(userId, saleId);
    if (!sale) throw new NotFoundException('Sale not found for this user');
    // Nest serializes the returned record as JSON with status 200.
    return sale;
  }
}
