import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = this.resolveMessage(exception);
    const logMessage = Array.isArray(message) ? message.join(', ') : message;
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    const safeMessage =
      status === HttpStatus.INTERNAL_SERVER_ERROR.valueOf() && isProduction
        ? 'Internal server error'
        : message;

    this.logger.error(
      `${request.method} ${request.url} failed with status ${status}: ${logMessage}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      message: safeMessage,
      error: this.resolveErrorCode(status),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private resolveMessage(exception: unknown): string | string[] {
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        return exceptionResponse;
      }

      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const { message } = exceptionResponse as {
          message?: string | string[];
        };
        return message ?? exception.message;
      }

      return exception.message;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }

  private resolveErrorCode(status: number): string {
    return HttpStatus[status] ?? 'INTERNAL_SERVER_ERROR';
  }
}
