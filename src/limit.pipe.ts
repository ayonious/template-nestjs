import { BadRequestException, PipeTransform } from '@nestjs/common';

// A pipe transforms or validates a handler argument before Nest calls the handler.
// Both list controllers reuse this pipe for an optional, non-negative integer limit.
export class LimitPipe implements PipeTransform {
  transform(value: unknown): number | undefined {
    if (value === undefined) return undefined;
    if (typeof value !== 'string' || !/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
      // Nest turns this into HTTP 400 instead of accepting an ambiguous limit.
      throw new BadRequestException('limit must be a non-negative safe integer');
    }
    return Number(value);
  }
}
