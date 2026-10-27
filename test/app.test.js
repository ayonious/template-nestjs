import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from '../dist/main.js';

test('POST caches JSON and GET returns the latest data', async (t) => {
  const app = await createApp();
  t.after(() => app.close());
  await app.listen(0, '127.0.0.1');
  const url = `${await app.getUrl()}/data`;

  const empty = await fetch(url);
  assert.equal(empty.status, 200);
  assert.equal(await empty.text(), '');

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
