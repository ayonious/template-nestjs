import { BadRequestException, Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBadRequestResponse, ApiBasicAuth, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiError, User, LoginInput } from './models.js';
import { CredentialsService } from './credentials.service.js';

@ApiTags('authentication')
@ApiUnauthorizedResponse({ type: ApiError, description: 'Missing or invalid credentials' })
@ApiInternalServerErrorResponse({ type: ApiError, description: 'Unexpected failure' })
@Controller('auth')
export class AuthController {
  constructor(private readonly credentials: CredentialsService) {}

  @ApiOperation({ summary: 'Validate dummy credentials (no session or token is created)' })
  @ApiOkResponse({ type: User })
  @ApiBadRequestResponse({ type: ApiError, description: 'userId and password must be non-empty strings within the length limits' })
  @Post('login')
  // Nest defaults POST to 201; validation returns 200 because it creates no record.
  @HttpCode(200)
  login(@Body() input: LoginInput) {
    // @Body parses JSON; explicit checks are still needed because types do not validate it.
    if (!input || typeof input.userId !== 'string' || !input.userId.trim() || input.userId.length > 100
      || typeof input.password !== 'string' || !input.password || input.password.length > 256) {
      throw new BadRequestException('userId and password must be non-empty strings (max 100 and 256 characters)');
    }
    return this.credentials.validate(input.userId, input.password);
  }

  @ApiOperation({ summary: 'Get the authenticated user using HTTP Basic credentials' })
  @ApiBasicAuth()
  @ApiOkResponse({ type: User })
  // A guard runs before the handler. Passport rejects bad credentials with 401
  // and places the validated public user on request.user when authentication succeeds.
  @UseGuards(AuthGuard('basic'))
  @Get('profile')
  profile(@Req() request: { user: User }) {
    return request.user;
  }
}
