import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { map, Observable } from 'rxjs';
import { ApiResponse } from 'src/types/api-response.interface';
import { createSuccessEnvelope } from '../envelope/response-envelope';

@Injectable()
export class ResponseEnvelopeInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  // Interceptor global untuk memastikan semua response sukses mengikuti envelope standar.
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    return next.handle().pipe(
      map((data) =>
        createSuccessEnvelope({
          statusCode: response.statusCode,
          data,
          request,
        }),
      ),
    );
  }
}
