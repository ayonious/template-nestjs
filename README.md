# Minimal NestJS

```sh
yarn install
yarn start
```

Runs on port 3000 (override with `PORT`).

The app contains 10 dummy users (IDs `1`–`10`), each with 0–5 sales.
Each sale has `id`, `userId`, `productName`, and `price` fields. IDs are strings.
The records are fixed in memory, so repeated requests return the same data.

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
the third. Both receive the same `DataService` through constructor injection.
The service owns the dummy collections and queries; no cache or external database
is needed. For example, sale `101` is:

```json
{ "id": "101", "userId": "1", "productName": "Notebook", "price": 12 }
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
