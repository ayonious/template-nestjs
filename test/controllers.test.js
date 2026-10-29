import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Test } from '@nestjs/testing';
import { AppModule, configureApp } from '../dist/main.js';
import { CredentialsService } from '../dist/credentials.service.js';
import { DataService } from '../dist/data.service.js';

const user = { id: 'test-user', name: 'Test user', createdAt: '2026-01-01T00:00:00.000Z' };
// Test resource controllers with the fake authenticated user provided below.
function fetch(url, options = {}) {
  return globalThis.fetch(url, { ...options, headers: { Authorization: `Basic ${Buffer.from('test-user:demo').toString('base64')}`, ...options.headers } });
}

const sale = { id: 'test-sale', userId: user.id, productName: 'Test product', price: 7,
  createdAt: '2026-02-01T00:00:00.000Z' };

async function createTestApp(t, overrides = {}) {
  // TestingModule uses Nest's real dependency injection container. Override the
  // provider with a small fake to test controllers independently of dummy fixtures.
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(DataService)
    .useValue({
      getUsers: (limit) => [user].slice(0, limit),
      getAllSales: (limit) => [sale].slice(0, limit),
      getUser: (id) => id === user.id ? user : null,
      getSales: (id) => id === user.id ? [sale] : [],
      getSale: (id, saleId) => id === user.id && saleId === sale.id ? sale : null,
      ...overrides,
    })
    // These tests isolate resource controllers; auth is covered with real password records separately.
    .overrideProvider(CredentialsService)
    .useValue({ validate: () => user })
    .compile();
  // Use real HTTP so route decorators, pipes, serialization, and errors are tested.
  const app = module.createNestApplication({ logger: false });
  t.after(() => app.close());
  configureApp(app);
  await app.listen(0, '127.0.0.1');
  return app.getUrl();
}

for (const [path, expected] of [
  ['/users', [user]], ['/sales', [sale]], ['/users/test-user', user],
  ['/users/test-user/sales/test-sale', sale], ['/sales/test-user', [sale]],
]) {
  test(`GET ${path} uses the injected provider`, async (t) => {
    const url = await createTestApp(t);
    const response = await fetch(`${url}${path}`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), expected);
    if (path === '/users' || path === '/sales') {
      assert.deepEqual(await (await fetch(`${url}${path}?limit=0`)).json(), []);
      assert.equal((await fetch(`${url}${path}?limit=-1`)).status, 400);
    } else {
      assert.equal((await fetch(`${url}${path}/missing`)).status, 404);
    }
  });
}

test('lookup routes return 404 when the injected provider cannot find a record', async (t) => {
  const url = await createTestApp(t);
  for (const path of ['/users/unknown', '/sales/unknown',
    '/users/test-user/sales/unknown', '/users/unknown/sales/test-sale']) {
    const response = await fetch(`${url}${path}`);
    assert.equal(response.status, 404);
    assert.equal((await response.json()).statusCode, 404);
  }
});

test('Swagger serves interactive docs and documents every API endpoint', async (t) => {
  const url = await createTestApp(t);
  const ui = await fetch(`${url}/docs`);
  assert.equal(ui.status, 200);
  assert.match(await ui.text(), /swagger-ui/);
  const script = await fetch(`${url}/docs/swagger-ui-bundle.js`);
  assert.equal(script.status, 200);
  await script.arrayBuffer();
  const response = await fetch(`${url}/docs-json`);
  assert.equal(response.status, 200);
  const document = await response.json();
  assert.deepEqual(Object.keys(document.paths).sort(), [
    '/auth/login', '/auth/profile', '/users', '/sales', '/users/{userId}', '/users/{userId}/sales/{saleId}', '/sales/{userId}',
  ].sort());
  for (const path of ['/users', '/sales']) {
    const operation = document.paths[path].get;
    const limit = operation.parameters.find((parameter) => parameter.name === 'limit');
    assert.equal(limit.required, false);
    assert.equal(limit.schema.minimum, 0);
    assert.ok(operation.responses['400']);
    assert.equal(operation.responses['200'].content['application/json'].schema.type, 'array');
  }
  for (const model of ['User', 'Sale']) {
    assert.equal(document.components.schemas[model].properties.createdAt.format, 'date-time');
  }
});

test('exception filter returns consistent documented 400 and 404 errors', async (t) => {
  const url = await createTestApp(t);
  const cases = [
    ['/users?limit=-1', 400, 'limit must be a non-negative safe integer'],
    ['/sales?limit=abc', 400, 'limit must be a non-negative safe integer'],
    ['/users/unknown', 404, 'User not found'],
    ['/sales/unknown', 404, 'User not found'],
    ['/users/test-user/sales/unknown', 404, 'Sale not found for this user'],
  ];
  const document = await (await fetch(`${url}/docs-json`)).json();
  assert.deepEqual(document.components.schemas.ApiError.required.sort(),
    ['message', 'path', 'statusCode', 'timestamp']);
  for (const [path, status, message] of cases) {
    const response = await fetch(`${url}${path}`);
    assert.equal(response.status, status);
    const body = await response.json();
    assert.deepEqual(body, { statusCode: status, message, path, timestamp: body.timestamp });
    assert.equal(new Date(body.timestamp).toISOString(), body.timestamp);
    const route = path.startsWith('/users/test-user/sales') ? '/users/{userId}/sales/{saleId}'
      : path.includes('/unknown') ? path.replace('/unknown', '/{userId}') : path.split('?')[0];
    assert.equal(document.paths[route].get.responses[status].content['application/json'].schema.$ref,
      '#/components/schemas/ApiError');
  }
});

for (const [method, path] of [
  ['getUsers', '/users'], ['getAllSales', '/sales'], ['getUser', '/users/test-user'],
  ['getSale', '/users/test-user/sales/test-sale'], ['getSales', '/sales/test-user'],
]) {
  test(`exception filter handles unexpected failure on GET ${path}`, async (t) => {
    // Simulate a dependency failing without adding artificial failure routes to the API.
    const url = await createTestApp(t, { [method]: () => { throw new Error('private database credentials'); } });
    const response = await fetch(`${url}${path}`);
    assert.equal(response.status, 500);
    const body = await response.json();
    assert.deepEqual(body, { statusCode: 500, message: 'Internal server error', path, timestamp: body.timestamp });
    assert.equal(new Date(body.timestamp).toISOString(), body.timestamp);
    const document = await (await fetch(`${url}/docs-json`)).json();
    for (const operation of Object.values(document.paths)) {
      assert.equal((operation.get ?? operation.post).responses['500'].content['application/json'].schema.$ref,
        '#/components/schemas/ApiError');
    }
  });
}
