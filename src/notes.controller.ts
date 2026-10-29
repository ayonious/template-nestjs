import { Body, Controller, Get, Post } from '@nestjs/common';
import { CacheService } from './cache.service.js';

// @Controller groups handlers under /notes. Nest creates this controller at startup.
@Controller('notes')
export class NotesController {
  // Nest uses this parameter's class type to inject the registered CacheService.
  // No manual construction is needed; storage stays in the service.
  constructor(private readonly cache: CacheService) {}

  // @Post handles POST /notes; Nest returns status 201 by default.
  @Post()
  // @Body supplies parsed JSON. This type describes it but does not validate it.
  save(@Body() data: Record<string, unknown>) {
    // Nest awaits the service's promise and serializes its result as JSON.
    return this.cache.save(data, 'notes');
  }

  // @Get handles GET /notes, returning status 200 by default.
  @Get()
  get() {
    // A missing value returns null, which Nest sends as an empty response body.
    return this.cache.get('notes');
  }
}
