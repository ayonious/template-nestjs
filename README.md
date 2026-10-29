# Minimal NestJS

```sh
yarn install
yarn start
```

Runs on port 3000 (override with `PORT`).

- `POST /data` stores a JSON object in memory and returns it (201).
- `POST /notes` stores a JSON object separately from `/data` (201).
- `GET /notes` returns the latest note (200), or an empty body before the first POST.
- `GET /date` returns `{ "date": "..." }` with a random ISO date between 2000 and 2100 (200).
- `GET /data` returns the latest stored object (200), or an empty body before the first POST.

### Users and sales

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

Each POST replaces the previous value for that resource. Restarting the app clears the cache.

The other resources use `DataController`, `NotesController`, and
`DateController`. Controllers map HTTP routes to service calls. Nest waits for
returned promises and serializes objects into JSON responses.

`AppModule` in `src/main.ts` registers the controllers and service providers.
At startup, Nest creates the providers and injects them through constructors:

- `DataController` → `CacheService` → `CACHE_MANAGER`
- `NotesController` → the same `CacheService` instance
- `DateController` → `DateService`

The controller constructor's class type tells Nest which provider to supply.
Inside `CacheService`, `@Inject(CACHE_MANAGER)` selects a provider by token instead.
`CacheModule.register()` supplies that token through Nest's official
`@nestjs/cache-manager` integration with `cache-manager`.

Providers are shared instances within an application by default. The data and notes
controllers use separate cache keys, so saving a note does not overwrite `/data`.
Storage stays in `CacheService`, acting as a small database layer. Its in-memory
store needs no separate server, and entries have no automatic expiry. `DateService`
shows a provider that computes a result without storing anything.

Request body types document the expected JSON shape; they do not validate input.

```sh
curl -X POST http://localhost:3000/data \
  -H 'Content-Type: application/json' \
  -d '{"message":"hello"}'
curl http://localhost:3000/data
```

Run the JavaScript HTTP integration test with Node's built-in test runner:

```sh
yarn test
```
