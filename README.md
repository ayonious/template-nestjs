# NestJS starter

A small TypeScript app with sample users and sales. You can list records, view individual records, and create a user with a name. Data is stored in memory and resets when the app restarts.

## Run it

```sh
yarn install
yarn start
```

The app runs at http://localhost:3000. Open [the API documentation](http://localhost:3000/docs) to try the endpoints.

## What’s inside

- **NestJS decorators (annotations):** `@Module()` connects the app’s parts, `@Controller()` groups routes, `@Get()` and `@Post()` define endpoints, `@Body()` reads JSON, `@Param()` reads URL values, and `@Query()` reads query options.
- **Shared services:** `@Injectable()` lets Nest supply the same `DataService` instance to controllers, keeping storage separate from request handling.
- **Validation and errors:** a custom `LimitPipe` checks list limits, the controller checks user names, and `@Catch()` with a global exception filter gives errors a consistent JSON response.
- **Packages and integrations:** `@nestjs/common` and `@nestjs/core` provide Nest’s building blocks; `@nestjs/platform-express` runs the HTTP server; `@nestjs/swagger` adds API documentation; `reflect-metadata` supports decorators; RxJS is included for Nest’s reactive support; and `@nestjs/testing` provides test utilities.
- **Swagger documentation:** `@ApiTags()` groups endpoints, `@ApiOperation()` describes them, `@ApiQuery()` documents list limits, and `@ApiProperty()` describes fields and examples. `@ApiOkResponse()`, `@ApiCreatedResponse()`, `@ApiBadRequestResponse()`, `@ApiNotFoundResponse()`, and `@ApiInternalServerErrorResponse()` document success and error responses. `DocumentBuilder` and `SwaggerModule` generate the interactive `/docs` page and `/docs-json` specification, including request bodies and response models.
- **Testing:** JavaScript tests use Node’s built-in test runner and assertions, plus `@nestjs/testing` to replace services with fake data. HTTP tests check routes, validation, errors, and Swagger output. Jest is not used.
- **Startup and logging:** `NestFactory` starts the app. `PORT` changes the default port, and `LOG_LEVEL` enables `error`, `info`, or `debug` logs. Logging is off by default.

## Commands

```sh
yarn build  # Compile the app
yarn test   # Build and run the tests
```
