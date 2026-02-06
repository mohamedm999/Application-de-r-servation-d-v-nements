import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Log the error details
    this.logger.error(
      `${request.method} ${request.url} - ${exception.constructor.name}: ${exception.message}`,
      exception.stack,
    );

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseObj = exception.getResponse();

      if (typeof responseObj === 'object') {
        message = (responseObj as any).message || message;
        error = (responseObj as any).error || error;
      } else {
        message = responseObj as string;
      }
    } else {
      // Log non-HTTP exceptions
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: typeof message === 'string' ? message : error,
      ...(Array.isArray(message) && { errors: message }), // Include validation errors if they exist
    });
  }
}
