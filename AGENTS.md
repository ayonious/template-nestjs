# Project guidelines

- Keep the project as minimal as possible: TypeScript NestJS app, one POST and one GET endpoint, and an in-memory cache.
- Use Yarn only for installing dependencies and running scripts. Keep `yarn.lock`; do not add other package-manager lockfiles.
- Write tests in JavaScript using Node's built-in test runner. Run `yarn test` to build and test the app.
- Assume readers know TypeScript but are new to NestJS. Add clear comments around Nest-specific concepts: decorators, controllers, modules, request bodies, response handling, instance lifecycle, and application startup. Explain what each part does and why it is needed without explaining basic TypeScript syntax.
- Keep comments accurate when changing behavior and preserve the small example's structure.
- Keep storage in the injectable `CacheService`, separate from the HTTP controller, so it acts as a small database layer.
- Use `@nestjs/cache-manager` and `cache-manager` for the in-memory cache, with no automatic expiry. Preserve the existing endpoint behavior when changing storage.
