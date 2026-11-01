import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

// @Catch() without a type handles both Nest HTTP exceptions and unexpected errors.
// Registered as APP_FILTER, this provider applies to every route in the application.
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  // Nest injects the HTTP adapter so response handling stays independent of Express.
  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const { httpAdapter } = this.adapterHost;
    const statusCode = exception instanceof HttpException ? exception.getStatus() : 500;
    let message = 'Internal server error';
    if (exception instanceof HttpException && statusCode < 500) {
      const response = exception.getResponse();
      // Built-in exceptions can carry a string or an object containing a message.
      const detail = typeof response === 'string' ? response : (response as { message?: unknown }).message;
      message = Array.isArray(detail) ? detail.join('; ') : typeof detail === 'string' ? detail : exception.message;
    }
    // Keep unexpected failure details in server logs, never in the public response.
    if (statusCode >= 500) this.logger.error(exception);
    httpAdapter.reply(context.getResponse(), {
      statusCode,
      message,
      path: httpAdapter.getRequestUrl(context.getRequest()),
      timestamp: new Date().toISOString(),
    }, statusCode);
  }
}
