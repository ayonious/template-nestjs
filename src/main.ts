import 'reflect-metadata';
import { pathToFileURL } from 'node:url';
import { Body, Controller, Get, Module, Post } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

@Controller('data')
class DataController {
  private cache: Record<string, unknown> | null = null;

  @Post()
  save(@Body() data: Record<string, unknown>) {
    this.cache = data;
    return this.cache;
  }

  @Get()
  get() {
    return this.cache;
  }
}

@Module({ controllers: [DataController] })
class AppModule {}

export function createApp() {
  return NestFactory.create(AppModule, { logger: false });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createApp()
    .then((app) => app.listen(Number(process.env.PORT ?? 3000)))
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
}
