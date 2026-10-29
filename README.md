# Minimal NestJS

```sh
yarn install
yarn start
```

Runs on port 3000 (override with `PORT`).

The app seeds three users and three sales in the cache at startup. Each sale has
an `id` and a `userId` linking it to its owner. IDs in URLs are strings.

| Endpoint | Example | Result |
| --- | --- | --- |
| `GET /users/:userId` | `/users/1` | Alice's user record |
| `GET /users/:userId/sales/:saleId` | `/users/1/sales/101` | Alice's notebook sale |
| `GET /sales/:userId` | `/sales/1` | All of Alice's sales |

Alice (`1`) owns sales `101` and `102`; Bob (`2`) owns sale `103`;
Charlie (`3`) has no sales, so `/sales/3` returns `[]`.
Missing users or sales return 404. A sale requested under the wrong user also
returns 404, for example `/users/2/sales/101`.

`UsersController` handles the first two routes, while `SalesController` handles
the third. Both receive the same `CacheService` through constructor injection.
The service owns collection storage and queries. Its `onModuleInit()` lifecycle
hook seeds the cache before Nest starts serving requests, with no automatic expiry.
Restarting recreates these example records.

```sh
curl http://localhost:3000/users/1
curl http://localhost:3000/users/1/sales/101
curl http://localhost:3000/sales/1
```

`AppModule` in `src/main.ts` registers both controllers and `CacheService`.
Controllers map HTTP routes to service calls. Nest awaits returned promises and
serializes results as JSON with status 200.

At startup, Nest creates providers and injects them through constructors:

- `UsersController` → `CacheService` → `CACHE_MANAGER`
- `SalesController` → the same `CacheService` instance

The controller constructor's class type tells Nest which provider to supply.
Inside `CacheService`, `@Inject(CACHE_MANAGER)` selects a provider by token instead.
`CacheModule.register()` supplies that token through Nest's official
`@nestjs/cache-manager` integration with `cache-manager`.

Providers are shared instances within an application by default. Storage stays
in `CacheService`, acting as a small database layer. Its in-memory store needs
no separate server. `@Param()` extracts named URL segments as strings, while
`NotFoundException` tells Nest to return an HTTP 404 JSON response.

Run the JavaScript HTTP integration test with Node's built-in test runner:

```sh
yarn test
```
