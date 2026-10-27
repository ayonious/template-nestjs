import { Injectable } from '@nestjs/common';

// @Injectable() marks this class as a provider that Nest can supply to other classes.
// This service acts as the app's data store; a database could replace its internals later.
@Injectable()
export class CacheService {
  // Nest shares one service instance within this app by default, preserving data
  // across requests. The data still lives only in memory and is lost on restart.
  private data: Record<string, unknown> | null = null;

  save(data: Record<string, unknown>) {
    this.data = data;
    return this.data;
  }

  get() {
    return this.data;
  }
}
