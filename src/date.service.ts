import { Injectable } from '@nestjs/common';

// @Injectable() marks this class as a provider that Nest can supply to other classes.
// Nest creates one shared instance by default; each call generates a fresh date.
@Injectable()
export class DateService {
  get() {
    const start = Date.UTC(2000, 0, 1);
    const end = Date.UTC(2100, 0, 1);
    return { date: new Date(start + Math.floor(Math.random() * (end - start))).toISOString() };
  }
}
