/**
 * In-memory store for the bearer JWT used by the API's `access-token`
 * security scheme. Kept intentionally small — the request interceptor reads
 * from here so auth wiring stays out of individual endpoint calls.
 */
let authToken: string | null = null;

export const setAuthToken = (token: string | null): void => {
  authToken = token;
};

export const getAuthToken = (): string | null => authToken;

export const clearAuthToken = (): void => {
  authToken = null;
};
