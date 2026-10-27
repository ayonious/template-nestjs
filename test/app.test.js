import assert from 'node:assert/strict';
import { test } from 'node:test';
// Test the compiled TypeScript app with plain JavaScript and Node's built-in test runner.
import { createApp } from '../dist/main.js';

test('POST caches JSON and GET returns the latest data', async (t) => {
  const app = await createApp();
  // Close Nest's HTTP server after the test, even when an assertion fails.
  t.after(() => app.close());
  // Port 0 asks the OS for an available port, avoiding clashes with a running app.
  await app.listen(0, '127.0.0.1');
  const url = `${await app.getUrl()}/data`;

  // Exercise real HTTP requests, including Nest's routing and response serialization.
  const empty = await fetch(url);
  assert.equal(empty.status, 200);
  assert.equal(await empty.text(), '');

  // A second POST checks that the cache replaces its previous value.
  for (const data of [{ message: 'hello', nested: { count: 1 } }, { message: 'updated' }]) {
    const saved = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    assert.equal(saved.status, 201);
    assert.deepEqual(await saved.json(), data);

    const cached = await fetch(url);
    assert.equal(cached.status, 200);
    assert.deepEqual(await cached.json(), data);
  }
});
