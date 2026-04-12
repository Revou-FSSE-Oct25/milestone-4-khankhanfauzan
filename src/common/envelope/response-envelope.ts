import { Request } from 'express';
import { ApiResponse } from 'src/types/api-response.interface';

type RequestWithMetadata = Request & { requestId?: string };

// Pemetaan default status HTTP ke error code internal agar konsisten lintas endpoint.
const defaultErrorCodeByStatus: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'AUTH_UNAUTHORIZED',
  403: 'AUTH_FORBIDDEN',
  404: 'RESOURCE_NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'RATE_LIMIT_EXCEEDED',
  500: 'INTERNAL_SERVER_ERROR',
};

// Mengambil request id dari header atau middleware tracking untuk kebutuhan audit/tracing.
function getRequestId(request: RequestWithMetadata): string | null {
  const headerValue = request.headers['x-request-id'];

  if (typeof headerValue === 'string') {
    return headerValue;
  }

  if (Array.isArray(headerValue) && headerValue.length > 0) {
    return headerValue[0];
  }

  return request.requestId ?? null;
}

// Menentukan path request yang akan ditampilkan pada response envelope.
function getPath(request: Request): string {
  return request.originalUrl || request.url || '/';
}

// Factory untuk membungkus semua response sukses dalam format envelope standar.
export function createSuccessEnvelope<T>(params: {
  statusCode: number;
  message?: string;
  data: T;
  request: Request;
}): ApiResponse<T> {
  const requestWithMetadata = params.request as RequestWithMetadata;

  return {
    success: true,
    statusCode: params.statusCode,
    message: params.message ?? 'Request successful',
    data: params.data,
    error: null,
    timestamp: new Date().toISOString(),
    path: getPath(params.request),
    requestId: getRequestId(requestWithMetadata),
  };
}

// Factory untuk membungkus semua response error dengan metadata operasional.
export function createErrorEnvelope(params: {
  statusCode: number;
  message: string;
  details?: string | string[];
  request: Request;
  errorCode?: string;
}): ApiResponse<null> {
  const requestWithMetadata = params.request as RequestWithMetadata;
  const fallbackCode =
    defaultErrorCodeByStatus[params.statusCode] ?? 'UNKNOWN_ERROR';

  return {
    success: false,
    statusCode: params.statusCode,
    message: params.message,
    data: null,
    error: {
      code: params.errorCode ?? fallbackCode,
      details: params.details ?? null,
    },
    timestamp: new Date().toISOString(),
    path: getPath(params.request),
    requestId: getRequestId(requestWithMetadata),
  };
}
