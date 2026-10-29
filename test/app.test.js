import assert from 'node:assert/strict';
import { test } from 'node:test';
// Test the compiled app with plain JavaScript and Node's built-in test runner.
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

test('resource controllers share storage without overwriting each other', async (t) => {
  const app = await createApp();
  t.after(() => app.close());
  await app.listen(0, '127.0.0.1');
  const url = await app.getUrl();

  const empty = await fetch(`${url}/notes`);
  assert.equal(empty.status, 200);
  assert.equal(await empty.text(), '');

  for (const [resource, data] of [
    ['data', { message: 'keep this' }],
    ['notes', { text: 'first note' }],
    ['notes', { text: 'replacement note' }],
  ]) {
    const response = await fetch(`${url}/${resource}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), data);
  }
  assert.deepEqual(await (await fetch(`${url}/data`)).json(), { message: 'keep this' });
  assert.deepEqual(await (await fetch(`${url}/notes`)).json(), { text: 'replacement note' });

  const response = await fetch(`${url}/date`);
  assert.equal(response.status, 200);
  const { date } = await response.json();
  assert.equal(new Date(date).toISOString(), date);
  assert.ok(date >= '2000-01-01' && date < '2100-01-01');
});

test('user and sales routes respect ownership and missing records', async (t) => {
  const app = await createApp();
  t.after(() => app.close());
  await app.listen(0, '127.0.0.1');
  const url = await app.getUrl();

  const user = await fetch(`${url}/users/1`);
  assert.equal(user.status, 200);
  assert.deepEqual(await user.json(), { id: '1', name: 'Alice' });

  const sale = await fetch(`${url}/users/1/sales/101`);
  assert.equal(sale.status, 200);
  assert.deepEqual(await sale.json(), {
    id: '101', userId: '1', product: 'Notebook', amount: 12,
  });

  for (const [userId, ids] of [['1', ['101', '102']], ['2', ['103']], ['3', []]]) {
    const response = await fetch(`${url}/sales/${userId}`);
    assert.equal(response.status, 200);
    const sales = await response.json();
    assert.deepEqual(sales.map((item) => item.id), ids);
    assert.ok(sales.every((item) => item.userId === userId));
  }

  for (const path of ['/users/missing', '/sales/missing', '/users/1/sales/missing',
    '/users/2/sales/101', '/users/missing/sales/101']) {
    const response = await fetch(`${url}${path}`);
    assert.equal(response.status, 404, path);
    assert.equal((await response.json()).statusCode, 404);
  }
});
