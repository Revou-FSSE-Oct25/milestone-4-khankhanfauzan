export interface ApiErrorDetail {
  code: string;
  details?: string | string[] | null;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  error: ApiErrorDetail | null;
  timestamp: string;
  path: string;
  requestId: string | null;
}
