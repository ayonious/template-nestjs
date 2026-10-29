// Loads the runtime metadata support Nest uses with decorators.
import 'reflect-metadata';
import { pathToFileURL } from 'node:url';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, Module } from '@nestjs/common';
import { ApiExceptionFilter } from './api-exception.filter.js';
import { APP_FILTER, NestFactory } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { CredentialsService } from './credentials.service.js';
import { BasicStrategy } from './basic.strategy.js';
import { loggingOptions } from './logging.js';
import { DataService } from './data.service.js';

import { UsersController } from './users.controller.js';
import { SalesController } from './sales.controller.js';

// A module tells Nest which controllers and providers belong to the application.
// Each controller handles one resource; providers can be shared by all controllers.
@Module({
  // Passport runs stateless authentication; no session store is needed.
  imports: [PassportModule.register({ session: false })],
  controllers: [UsersController, SalesController, AuthController],
  // Nest creates one instance of each provider per application by default.
  // All storage controllers receive the same DataService instance.
  // APP_FILTER registers the filter globally while keeping constructor injection.
  providers: [DataService, CredentialsService, BasicStrategy, { provide: APP_FILTER, useClass: ApiExceptionFilter }],
})
export class AppModule {}

// The factory builds the app from its root module, using the installed Express adapter.
// Creating the app separately from listening lets the test choose its own port.
// Keep configuration shared so tests and normal startup expose identical docs.
export function configureApp(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Users and sales API')
    .setDescription('A small NestJS example with injected dummy data.')
    .setVersion('1.0')
    .addBasicAuth()
    .build();
  // Swagger scans controller metadata to build OpenAPI and serves an interactive UI.
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
}

export async function createApp() {
  // LOG_LEVEL controls Nest startup/error logs; requests never log passwords.
  const app = await NestFactory.create(AppModule, { logger: loggingOptions() });
  configureApp(app);
  return app;
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
