# Minimal NestJS + TypeScript

```sh
yarn install
yarn start
```

Runs on port 3000 (override with `PORT`).

- `POST /data` stores a JSON object in memory and returns it (201).
- `GET /data` returns the latest stored object (200), or an empty body before the first POST.

Each POST replaces the previous value. Restarting the app clears the cache.

The controller handles HTTP requests and delegates storage to an injected `CacheService`
in `src/cache.service.ts`. The service uses Nest's official `@nestjs/cache-manager`
integration with the third-party `cache-manager` package. Its in-memory store needs
no separate server; entries have no automatic expiry. The controller stays separate
from storage, ready for a different backend later.

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
