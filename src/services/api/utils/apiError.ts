export interface ApiErrorParams {
  message: string;
  statusCode: number;
  error?: string;
  cause?: unknown;
}

/**
 * Normalised error thrown for every failed API call. Components never have to
 * deal with raw Axios errors — they always receive an {@link ApiError} with a
 * predictable shape.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly error?: string;

  constructor({ message, statusCode, error, cause }: ApiErrorParams) {
    super(message, { cause });
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.error = error;
  }
}
