import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { createErrorEnvelope } from '../envelope/response-envelope';

interface HttpExceptionResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  // Menormalisasi semua exception menjadi error envelope yang konsisten untuk client.
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse();
      message =
        (errorResponse as HttpExceptionResponse).message || exception.message;
    }

    const normalizedMessage = Array.isArray(message)
      ? message.join(', ')
      : message;
    const apiResponse = createErrorEnvelope({
      statusCode: status,
      message: normalizedMessage,
      details: message,
      request,
    });

    response.status(status).json(apiResponse);
  }
}
