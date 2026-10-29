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

Each POST replaces the previous value for that resource. Restarting the app clears the cache.

Each resource has its own controller: `DataController`, `NotesController`, and
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

Providers are shared instances within an application by default. The two storage
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
