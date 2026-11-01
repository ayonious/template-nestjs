# NestJS starter

A small TypeScript app with sample users and sales. You can list records, view individual records, and create a user with a name. Data is stored in memory and resets when the app restarts.

## Run it

```sh
yarn install
yarn start
```

The app runs at http://localhost:3000. Open [the API documentation](http://localhost:3000/docs) to try the endpoints.

## What’s inside

- **Swagger:** Creates documentation for each endpoint, including inputs, example data, and possible responses. After starting the app, open [http://localhost:3000/docs](http://localhost:3000/docs) to read the docs and try requests in your browser. The generated OpenAPI file is available at [/docs-json](http://localhost:3000/docs-json).

- **NestJS decorators:** These annotations tell Nest how the app is organized and how to handle requests.
  - `@Module()` — connects the controllers and services that make up the app.
  - `@Controller()` — groups related endpoints under a URL, such as `/users`.
  - `@Get()` — handles requests to read data.
  - `@Post()` — handles requests to create data.
  - `@Body()` — reads the JSON sent with a request, such as a new user’s name.
  - `@Param()` — reads a value from the URL, such as the user ID in `/users/1`.
  - `@Query()` — reads an option after `?` in the URL, such as `limit` in `/users?limit=5`.
  - `@Injectable()` — lets Nest create a service and share it with controllers that need it.
  - `@Catch()` — marks the class that handles errors and turns them into JSON responses.

- **Swagger decorators:** Describe what appears in the API documentation.
  - `@ApiTags()` — groups endpoints by topic, such as users or sales.
  - `@ApiOperation()` — adds a short description of an endpoint.
  - `@ApiQuery()` — describes query options, such as the list limit.
  - `@ApiProperty()` — describes a data field and gives an example value.
  - `@ApiOkResponse()` — describes a successful read (200).
  - `@ApiCreatedResponse()` — describes a successful creation (201).
  - `@ApiBadRequestResponse()` — describes invalid input (400).
  - `@ApiNotFoundResponse()` — describes a missing record (404).
  - `@ApiInternalServerErrorResponse()` — describes an unexpected error (500).

- **Testing:** JavaScript tests use Node’s built-in test runner. They check endpoints, input checks, error responses, logging options, and API documentation. Run them with `yarn test`.

- **Startup and logging:** `NestFactory` creates the app. It listens on port 3000 unless you set `PORT`. Logging is off by default; set `LOG_LEVEL` to `error`, `info`, or `debug` to see logs.

## Commands

```sh
yarn build  # Compile the app
yarn test   # Build and run the tests
```
