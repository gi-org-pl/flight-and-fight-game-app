import {
  attachAuthToken,
  normalizeApiError,
} from '@/services/api/utils/interceptors';
import axios, { type AxiosInstance } from 'axios';

/** Falls back to the local development server from the OpenAPI document. */
const DEFAULT_BASE_URL = 'https://api-faf.gi.org.pl/';

/**
 * Builds an Axios instance pre-wired with the auth + error-normalisation
 * interceptors. Exposed as a factory so tests can spin up isolated instances.
 */
export const createApiClient = (
  baseURL: string = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL,
): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use(attachAuthToken);
  client.interceptors.response.use((response) => response, normalizeApiError);

  return client;
};

/** Shared client instance used by every endpoint module. */
export const apiClient = createApiClient();
