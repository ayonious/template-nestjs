// Loads the runtime metadata support Nest uses with decorators.
import 'reflect-metadata';
import { pathToFileURL } from 'node:url';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service.js';

import { UsersController } from './users.controller.js';
import { SalesController } from './sales.controller.js';

// A module tells Nest which controllers and providers belong to the application.
// Each controller handles one resource; providers can be shared by all controllers.
@Module({
  // CacheModule supplies the CACHE_MANAGER token used inside CacheService.
  // Its default store lives in this process, so restarting clears the saved data.
  imports: [CacheModule.register()],
  controllers: [UsersController, SalesController],
  // Nest creates one instance of each provider per application by default.
  // All storage controllers receive the same CacheService instance.
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
