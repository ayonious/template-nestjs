import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from '../dist/main.js';
import { loggingOptions } from '../dist/logging.js';

test('dummy credentials validate passwords and guard the authenticated profile', async (t) => {
  const app = await createApp();
  t.after(() => app.close());
  await app.listen(0, '127.0.0.1');
  const url = await app.getUrl();
  const login = (body) => fetch(`${url}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  for (let id = 1; id <= 10; id++) {
    const response = await login({ userId: String(id), password: `Demo-user-${id}!` });
    assert.equal(response.status, 200);
    const user = await response.json();
    assert.equal(user.id, String(id));
    assert.deepEqual(Object.keys(user).sort(), ['createdAt', 'id', 'name']);
  }
  for (const body of [{ userId: '1', password: 'wrong' }, { userId: '11', password: 'wrong' },
    { userId: '1', password: 'Demo-user-2!' }]) {
    const response = await login(body);
    assert.equal(response.status, 401);
    const error = await response.json();
    assert.equal(error.message, 'Invalid credentials');
    assert.equal(error.path, '/auth/login');
  }
  for (const body of [{}, null, [], { userId: 1, password: 'x' },
    { userId: '1', password: '' }, { userId: ' ', password: 'x' },
    { userId: '1', password: 'x'.repeat(257) }]) {
    assert.equal((await login(body)).status, 400);
  }
  for (const authorization of [undefined, 'Basic invalid', 'Bearer token',
    `Basic ${Buffer.from('1:wrong').toString('base64')}`]) {
    const response = await fetch(`${url}/auth/profile`, {
      headers: authorization ? { Authorization: authorization } : {},
    });
    assert.equal(response.status, 401);
    const error = await response.json();
    assert.equal(error.statusCode, 401);
    assert.equal(error.path, '/auth/profile');
  }
  const profile = await fetch(`${url}/auth/profile`, {
    headers: { Authorization: `Basic ${Buffer.from('1:Demo-user-1!').toString('base64')}` },
  });
  assert.equal(profile.status, 200);
  assert.deepEqual(await profile.json(), await (await fetch(`${url}/users/1`, { headers: { Authorization: `Basic ${Buffer.from('1:Demo-user-1!').toString('base64')}` } })).json());
  // A successful login does not grant access to subsequent unauthenticated requests.
  assert.equal((await fetch(`${url}/auth/profile`)).status, 401);

  const document = await (await fetch(`${url}/docs-json`)).json();
  assert.deepEqual(document.components.securitySchemes.basic, { type: 'http', scheme: 'basic' });
  assert.deepEqual(document.paths['/auth/profile'].get.security, [{ basic: [] }]);
  assert.ok(document.paths['/auth/login'].post.responses['400']);
  for (const path of ['/auth/profile', '/auth/login']) {
    const operation = document.paths[path].get ?? document.paths[path].post;
    assert.equal(operation.responses['401'].content['application/json'].schema.$ref,
      '#/components/schemas/ApiError');
  }
});

test('logging option supports off, error, info, debug and rejects typos', () => {
  assert.equal(loggingOptions('off'), false);
  assert.deepEqual(loggingOptions('error'), ['error']);
  assert.deepEqual(loggingOptions('info'), ['error', 'warn', 'log']);
  assert.deepEqual(loggingOptions('debug'), ['error', 'warn', 'log', 'debug', 'verbose']);
  assert.throws(() => loggingOptions('typo'), /LOG_LEVEL/);
});

test('create users with chosen passwords and require matching credentials on lookup', async (t) => {
  const app = await createApp();
  t.after(() => app.close());
  await app.listen(0, '127.0.0.1');
  const url = await app.getUrl();
  const postUser = (body) => fetch(`${url}/users`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const password = 'chosen-password';
  const created = await postUser({ name: 'Taylor', password });
  assert.equal(created.status, 201);
  const user = await created.json();
  assert.equal(user.id, '11');
  assert.equal(user.name, 'Taylor');
  assert.deepEqual(Object.keys(user).sort(), ['createdAt', 'id', 'name']);
  assert.equal(new Date(user.createdAt).toISOString(), user.createdAt);
  const lookup = (userId, loginId, pass) => fetch(`${url}/users/${userId}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${loginId}:${pass}`).toString('base64')}` },
  });
  assert.equal((await fetch(`${url}/users/${user.id}`)).status, 401);
  assert.equal((await lookup(user.id, user.id, 'wrong')).status, 401);
  assert.equal((await lookup(user.id, '1', 'Demo-user-1!')).status, 403);
  assert.deepEqual(await (await lookup(user.id, user.id, password)).json(), user);
  assert.equal((await lookup('1', user.id, password)).status, 403);
  const profile = await fetch(`${url}/auth/profile`, {
    headers: { Authorization: `Basic ${Buffer.from(`${user.id}:${password}`).toString('base64')}` },
  });
  assert.deepEqual(await profile.json(), user);
  const sales = await fetch(`${url}/sales/${user.id}`);
  assert.deepEqual(await sales.json(), []);
  for (const body of [{}, { name: 'No password' }, { name: '', password },
    { name: 'Test', password: ' ' }, { name: 'Test', password: 123 },
    { name: 'x'.repeat(101), password }, { name: 'Test', password: 'x'.repeat(257) }]) {
    assert.equal((await postUser(body)).status, 400);
  }
  const users = await (await fetch(`${url}/users`)).json();
  assert.equal(users.length, 11); // Invalid bodies did not create partial user records.
  assert.ok(users.every((item) => !('password' in item)));
  const next = await (await postUser({ name: 'Second', password: 'second' })).json();
  assert.equal(next.id, '12');
  const docs = await (await fetch(`${url}/docs-json`)).json();
  assert.ok(docs.paths['/users'].post.responses['201']);
  assert.ok(docs.paths['/users'].post.responses['400']);
  assert.ok(docs.paths['/users/{userId}'].get.responses['403']);
  assert.deepEqual(docs.paths['/users/{userId}'].get.security, [{ basic: [] }]);
});
