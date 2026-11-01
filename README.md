# NestJS starter

A small TypeScript app built with NestJS. It includes sample users and sales to show how a basic API works.

## What’s inside

- User and sales endpoints for listing and viewing sample records.
- A way to create users with a name and password.
- Example login and password-protected profile endpoints.
- Interactive API documentation to try requests in your browser.
- Basic input checks, error handling, and optional logging.
- JavaScript tests using Node’s built-in test runner.

Data is stored in memory and resets when the app restarts. The included accounts and passwords are for demonstration.

## Run it

```sh
yarn install
yarn start
```

The app runs at http://localhost:3000. Open [the API documentation](http://localhost:3000/docs) to explore and try the endpoints.

For protected requests, try user ID `1` with password `Demo-user-1!`.

## Project files

- `src/main.ts` — connects the app’s parts and starts the server.
- `src/*controller.ts` — handles requests for users, sales, and login.
- `src/data.service.ts` — stores the sample users and sales.
- `src/credentials.service.ts` and `src/basic.strategy.ts` — check passwords.
- Other files in `src/` — define data shapes, check list limits, handle errors, and configure logging.
- `test/` — checks the app’s behavior.

## Commands

```sh
yarn build  # Compile the app
yarn test   # Build and run the tests
```

Set `PORT` to use a different port, or `LOG_LEVEL` to `error`, `info`, or `debug` to enable logging. Logging is off by default.
