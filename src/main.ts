// Loads the runtime metadata support Nest uses with TypeScript decorators.
import 'reflect-metadata';
import { pathToFileURL } from 'node:url';
import { Body, Controller, Get, Module, Post } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service.js';

// A controller groups HTTP handlers. This prefix makes every route below start at /data.
// Nest creates and manages the controller instance when the application starts.
@Controller('data')
class DataController {
  // Nest reads this constructor's parameter type and injects the registered service.
  // The controller handles HTTP; the service owns storage, like a database layer.
  constructor(private readonly cache: CacheService) {}

  // With no extra path, @Post() handles POST /data. Nest defaults POST responses to 201.
  @Post()
  // @Body() supplies the parsed JSON request body as this method's argument.
  // The TypeScript type describes the expected shape; it does not validate incoming JSON.
  save(@Body() data: Record<string, unknown>) {
    // Nest serializes the returned object into the HTTP response automatically.
    return this.cache.save(data);
  }

  // @Get() handles GET /data and defaults to status 200.
  @Get()
  get() {
    // Returning null produces an empty response body before anything has been saved.
    return this.cache.get();
  }
}

// A module tells Nest which controllers and services belong to the application.
// Registering CacheService as a provider lets Nest create it and inject it into the controller.
@Module({
  // Imports make another module's providers available here. The default cache store
  // uses memory in this process, so restarting the app still clears its data.
  imports: [CacheModule.register()],
  controllers: [DataController],
  providers: [CacheService],
})
class AppModule {}

// The factory builds the app from its root module, using the installed Express adapter.
// Creating the app separately from listening lets the test choose its own port.
export function createApp() {
  // Disable Nest's startup logs to keep this example and its test output small.
  return NestFactory.create(AppModule, { logger: false });
}

// Start listening only when this file is run directly, not when a test imports it.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createApp()
    // listen() starts the HTTP server. PORT overrides the default port of 3000.
    .then((app) => app.listen(Number(process.env.PORT ?? 3000)))
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
}
