import assert from 'node:assert/strict';
import { test } from 'node:test';
// Test the compiled app with plain JavaScript and Node's built-in test runner.
import { createApp } from '../dist/main.js';

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

test('previous example endpoints are no longer exposed', async (t) => {
  const app = await createApp();
  t.after(() => app.close());
  await app.listen(0, '127.0.0.1');
  const url = await app.getUrl();

  for (const [method, path] of [
    ['GET', '/data'], ['POST', '/data'],
    ['GET', '/notes'], ['POST', '/notes'], ['GET', '/date'],
  ]) {
    const response = await fetch(`${url}${path}`, { method });
    assert.equal(response.status, 404, `${method} ${path}`);
  }
});
