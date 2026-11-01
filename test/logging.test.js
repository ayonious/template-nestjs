import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loggingOptions } from '../dist/utils/logging.js';

test('logging option supports off, error, info, debug and rejects typos', () => {
  assert.equal(loggingOptions('off'), false);
  assert.deepEqual(loggingOptions('error'), ['error']);
  assert.deepEqual(loggingOptions('info'), ['error', 'warn', 'log']);
  assert.deepEqual(loggingOptions('debug'), ['error', 'warn', 'log', 'debug', 'verbose']);
  assert.throws(() => loggingOptions('typo'), /LOG_LEVEL/);
});

