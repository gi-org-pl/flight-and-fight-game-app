import axios, { type InternalAxiosRequestConfig } from "axios";
import { apiErrorResponseSchema } from "@/services/api/schemas/error";
import { ApiError } from "@/services/api/utils/apiError";
import { getAuthToken } from "@/services/api/utils/authToken";

/**
 * Request interceptor — attaches the bearer JWT (when present) so endpoint
 * calls never have to deal with auth headers themselves.
 */
export const attachAuthToken = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  const token = getAuthToken();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
};

/**
 * Response error interceptor — turns any failure into a normalised
 * {@link ApiError}, preferring the API's structured error body when available.
 */
export const normalizeApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const parsed = apiErrorResponseSchema.safeParse(error.response?.data);

    if (parsed.success) {
      throw new ApiError({ ...parsed.data, cause: error });
    }

    throw new ApiError({
      message: error.message,
      statusCode: error.response?.status ?? 0,
      error: error.code,
      cause: error,
    });
  }

  if (error instanceof Error) {
    throw new ApiError({ message: error.message, statusCode: 0, cause: error });
  }

  throw new ApiError({
    message: "Unknown API error",
    statusCode: 0,
    cause: error,
  });
};
