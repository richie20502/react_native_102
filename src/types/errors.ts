export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

export class ApiError extends Error {
  type: ErrorType;
  status?: number;
  data?: any;

  constructor(type: ErrorType, message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.data = data;
  }

  static isNetworkError(error: unknown): error is ApiError {
    return error instanceof ApiError && error.type === ErrorType.NETWORK_ERROR;
  }

  static isUnauthorized(error: unknown): error is ApiError {
    return error instanceof ApiError && error.type === ErrorType.UNAUTHORIZED;
  }
}