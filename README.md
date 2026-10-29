# Minimal NestJS

```sh
yarn install
yarn start
```

Runs on port 3000 (override with `PORT`).

The app contains 10 dummy users (IDs `1`–`10`), each with 0–5 sales.
Each sale has `id`, `userId`, `productName`, `price`, and `createdAt` fields. Users also have `createdAt`. IDs are strings.
The records are fixed in memory, so repeated requests return the same data.

| Endpoint | Example | Result |
| --- | --- | --- |
| `GET /users` | `/users?limit=5` | First 5 users |
| `GET /sales` | `/sales?limit=5` | First 5 sales across all users |
| `GET /users/:userId` | `/users/1` | Alice's user record |
| `GET /users/:userId/sales/:saleId` | `/users/1/sales/101` | Alice's notebook sale |
| `GET /sales/:userId` | `/sales/1` | All of Alice's sales |

Both collection routes accept an optional `limit` query parameter. Omit it to
return all records; `limit=0` returns `[]`. Invalid or negative values return 400.
Lists use fixture order, oldest first. Creation times are fixed ISO 8601 UTC
strings, also returned by individual lookup routes. `LimitPipe` demonstrates how
Nest validates `@Query()` arguments before invoking a controller method.

Alice (`1`) owns sales `101` and `102`; Bob (`2`) owns sale `103`;
Charlie (`3`) has no sales, so `/sales/3` returns `[]`.
Missing users or sales return 404. A sale requested under the wrong user also
returns 404, for example `/users/2/sales/101`.

`UsersController` handles user routes and nested sale lookups;
`SalesController` handles sales lists. Both receive the same `DataService` through constructor injection.
The service owns the dummy collections and queries; no cache or external database
is needed. For example, sale `101` is:

```json
{ "id": "101", "userId": "1", "productName": "Notebook", "price": 12, "createdAt": "2026-02-01T10:00:00.000Z" }
```

```sh
curl http://localhost:3000/users/1
curl http://localhost:3000/users/1/sales/101
curl http://localhost:3000/sales/1
```

`AppModule` in `src/main.ts` registers both controllers and `DataService`.
Controllers map HTTP routes to service calls. Nest serializes returned objects and arrays as JSON with status 200.

At startup, Nest creates providers and injects them through constructors:

- `UsersController` → `DataService`
- `SalesController` → the same `DataService` instance

The controller constructor's class type tells Nest which provider to supply.
Providers are shared instances within an application by default. Storage stays
in `DataService`, acting as a small database layer. Its in-memory store needs
no separate server. `@Param()` extracts named URL segments as strings, while
`NotFoundException` tells Nest to return an HTTP 404 JSON response.

Run the JavaScript HTTP integration test with Node's built-in test runner:

```sh
yarn test
```

## Interactive API documentation

After `yarn start`, open [Swagger UI](http://localhost:3000/docs) to browse and
try all five endpoints. The OpenAPI document is available at
[docs-json](http://localhost:3000/docs-json).

Swagger decorators on controllers describe operations, optional limits, response
models, and errors. `src/models.ts` uses classes with `@ApiProperty()` because
interfaces do not exist at runtime. These decorators document response shapes;
they do not add request validation. `configureApp()` shares Swagger setup between
normal startup and tests.

## Tests and dependency injection

`yarn test` builds the app and runs JavaScript tests with Node's built-in runner.
`test/app.test.js` checks real dummy data, limits, timestamps, and missing records.
`test/controllers.test.js` uses `Test.createTestingModule()` from `@nestjs/testing`
and `.overrideProvider(DataService).useValue(fake)` to supply controlled test data
through Nest's dependency injection container. Each endpoint has its own HTTP test,
so routing, pipes, response serialization, and errors are exercised as well.
Swagger UI, its JavaScript asset, and the generated OpenAPI document are tested too.

See Nest's [Swagger documentation](https://docs.nestjs.com/openapi/introduction)
and [testing utilities](https://docs.nestjs.com/fundamentals/testing) for more.

## Exception handling

`ApiExceptionFilter` is registered through Nest's `APP_FILTER` token, so it handles
errors across all routes and can receive injected dependencies. `@Catch()` catches
both built-in HTTP exceptions and unexpected failures. It returns a consistent body:

```json
{
  "statusCode": 404,
  "message": "User not found",
  "path": "/users/unknown",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

- **400:** invalid collection limit, for example `/users?limit=-1`.
- **404:** missing user or sale, including a sale requested under the wrong user.
- **500:** unexpected failure, with a generic `Internal server error` message;
  internal details are logged on the server.

Swagger shows the shared `ApiError` schema for these responses. Tests assert the
error bodies and Swagger schemas, and replace service methods with failing fakes
to test 500 handling on each endpoint without adding artificial failure routes.
See Nest's [exception filter documentation](https://docs.nestjs.com/exception-filters).
