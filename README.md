# Minimal NestJS

```sh
yarn install
yarn start
```

Runs on port 3000 (override with `PORT`).

## What is already set up for your next project?

When you copy this template, the following foundation is already connected.
You can focus on your application's resources and business rules instead of
rebuilding the initial NestJS setup.

| Already set up | What it handles for you | What you add for your project |
| --- | --- | --- |
| Application startup and HTTP server | `NestFactory` creates the app with the Express adapter; `yarn start` builds and starts it using `PORT` or 3000. | Your deployment settings and chosen port. |
| TypeScript and decorator metadata | Strict compilation, decorator support, and `reflect-metadata` are configured for Nest's runtime dependency injection. | Your own application code. |
| Root module | `AppModule` connects the controllers, service, and global exception filter. | Register new controllers and providers, or import feature modules as the app grows. |
| Routing and controllers | Nest maps `@Controller()` and `@Get()` decorators to HTTP routes and extracts URL segments with `@Param()`. | Resource names, new handlers, and any additional HTTP methods. |
| Dependency injection | Nest creates and shares registered service instances and supplies them through constructors. You do not need to construct services in each controller. | New injectable services and their provider registrations. |
| HTTP responses | Nest serializes returned objects and arrays as JSON, uses the handler's status code, and awaits promises returned by asynchronous handlers. | Return values and any custom status codes or headers. |
| Query validation example | `LimitPipe` validates optional collection limits and produces HTTP 400 for invalid values. | Validation rules for other query parameters and request bodies. |
| Global exception handling | `ApiExceptionFilter` gives failures a consistent JSON shape; 500 responses hide internal details. | Throw meaningful HTTP exceptions for your business rules. |
| Swagger / OpenAPI | `/docs` serves interactive documentation and `/docs-json` serves the generated specification. | Update the API title and add Swagger decorators and response models for new endpoints. |
| Nest testing utilities | Tests create Nest's dependency injection container, replace `DataService` with a fake, and exercise endpoints over HTTP. | Tests and fake dependencies for each new feature. |
| Password authentication example | Passport's Basic strategy and a Nest guard protect `/auth/profile`; a separate login endpoint validates credentials. | Your account provisioning, production credentials, and access rules. |
| Configurable logging | `LOG_LEVEL` selects off, error, info, or debug Nest logs. | The logging level and any application-specific log events. |
| Build and test commands | `yarn build`, `yarn start`, and `yarn test` are ready; tests use JavaScript and Node's built-in runner. | Run these commands during development and connect them to CI if needed. |

Some rows are built-in Nest behavior; others are configured by this template,
such as Swagger, the custom limit pipe, the exception filter, and the test harness.
The setup is reusable, but new endpoints still need their own documentation and tests.

The users and sales are example data in `DataService`. For a real application,
replace that data layer and configure persistence, production authentication and
authorization, broader request-body validation, environment configuration, and deployment.
The authentication below uses public dummy credentials for learning. Nest logging
is configurable through `LOG_LEVEL`, with logging disabled by default.

## Example API

The app contains 10 dummy users (IDs `1`–`10`), each with 0–5 sales.
Each sale has `id`, `userId`, `productName`, `price`, and `createdAt` fields. Users also have `createdAt`. IDs are strings.
The initial records are fixed. New users can be added in memory; restarting resets all data.

| Endpoint | Example | Result |
| --- | --- | --- |
| `GET /users` | `/users?limit=5` | First 5 users |
| `GET /sales` | `/sales?limit=5` | First 5 sales across all users |
| `POST /users` | JSON with `name` and `password` | Creates a user (201) |
| `GET /users/:userId` | `/users/1` | Your user record, requiring matching Basic credentials |
| `GET /users/:userId/sales/:saleId` | `/users/1/sales/101` | Alice's notebook sale |
| `GET /sales/:userId` | `/sales/1` | All of Alice's sales |

Both collection routes accept an optional `limit` query parameter. Omit it to
return all records; `limit=0` returns `[]`. Invalid or negative values return 400.
Lists use fixture order, oldest first. Creation times are ISO 8601 UTC
strings: fixed for initial records, current time for new users. `LimitPipe` demonstrates how
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
curl -u '1:Demo-user-1!' http://localhost:3000/users/1
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
try all eight endpoint operations. The OpenAPI document is available at
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

## Logging options

```sh
LOG_LEVEL=info yarn start
LOG_LEVEL=error yarn start
LOG_LEVEL=debug yarn start
LOG_LEVEL=off yarn start
```

Omitting `LOG_LEVEL` disables logging. `info` enables standard startup messages,
warnings, and errors; `error` enables errors only; `debug` also enables debug and
verbose messages. Invalid values fail startup with a clear error. This configures
Nest's logger, not HTTP request-body logging. The exception filter logs unexpected
failures when error logging is enabled; credentials are not explicitly logged.

## Dummy password store and Passport authentication

`CredentialsService` holds a private in-memory array of `{ userId, password }`
records, like the user collection. Passwords are stored as plain text for this demo.
Its `onModuleInit()` hook seeds the dummy credentials before requests are served.
New users add a record to this password database as well as the user collection.
Restarting resets both collections. Public responses never include passwords.

Every dummy user has the public example password `Demo-user-<userId>!`, for example
user `1` uses `Demo-user-1!`. These credentials are intentionally predictable demo
data; replace this provisioning flow for real accounts. Use HTTPS when sending
passwords outside local development, including HTTP Basic credentials.

| Endpoint | Behavior |
| --- | --- |
| `POST /auth/login` | Validates JSON `{ "userId": "1", "password": "Demo-user-1!" }` and returns the public user with status 200. Malformed input returns 400; invalid credentials return 401. |
| `GET /auth/profile` | Requires HTTP Basic credentials and returns the authenticated user. Missing or invalid credentials return 401. |

```sh
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"userId":"1","password":"Demo-user-1!"}'
curl -u '1:Demo-user-1!' http://localhost:3000/auth/profile
```

Login checks credentials only: it issues no token or session. Each protected request
must supply credentials again. `GET /users/:userId` requires matching Basic
credentials for that user: missing or wrong credentials return 401, while valid
credentials belonging to another user return 403. User lists and sales routes remain public.
In Swagger, use **Authorize** with username `1` and password `Demo-user-1!` to try
`/auth/profile` or `/users/1`.

`PassportModule` integrates the Passport plugin with Nest. `BasicStrategy` receives
the parsed credentials, injects `CredentialsService`, and returns a public user.
`@UseGuards(AuthGuard('basic'))` runs authentication before the profile handler;
on success, Passport places the user on `request.user`. `@Body()` and explicit
checks validate the login input; its Swagger class alone does not validate JSON.

Tests exercise all ten dummy credentials, wrong and missing passwords, invalid
bodies, the protected route, Swagger's authentication schema, and logging options.
See the [Nest Passport guide](https://docs.nestjs.com/recipes/passport),
[Passport HTTP Basic plugin](https://www.passportjs.org/packages/passport-http/),
and [Nest logging documentation](https://docs.nestjs.com/techniques/logger).

## Creating a user with a password

```sh
curl -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Taylor","password":"my-demo-password"}'
curl -u '11:my-demo-password' http://localhost:3000/users/11
```

In a fresh app, the first new user has ID `11`. The creation response contains
`id`, `name`, and `createdAt`; use the returned ID as the Basic username. Name and
password are required strings with maximum lengths of 100 and 256 respectively.
Invalid bodies return 400 without creating a user. Newly created users have no sales.
Chosen passwords also work with `/auth/login` and `/auth/profile`.

Swagger documents creation and the protected user lookup, including 400, 401,
and 403 errors. Tests verify chosen passwords, missing/wrong credentials,
cross-user rejection, invalid creation bodies, and password-free public responses.
