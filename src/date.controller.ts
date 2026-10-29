import { Controller, Get } from '@nestjs/common';
import { DateService } from './date.service.js';

// This controller exposes a separate resource at /date.
@Controller('date')
export class DateController {
  // Nest injects DateService because AppModule registers it as a provider.
  constructor(private readonly dates: DateService) {}

  // GET /date returns status 200 and Nest serializes the returned object as JSON.
  @Get()
  get() {
    return this.dates.get();
  }
}
