export { apiClient, createApiClient } from "@/services/api/client/apiClient";
export {
  type ApiErrorResponse,
  apiErrorResponseSchema,
} from "@/services/api/schemas/error";
export {
  type GetSessionResponse,
  getSessionResponseSchema,
  type SessionCredentialsResponse,
  sessionCredentialsResponseSchema,
  type SessionState,
  sessionStateSchema,
} from "@/services/api/schemas/session";
export {
  type StatusResponse,
  statusResponseSchema,
} from "@/services/api/schemas/status";
export { createSession, getSession, joinSession } from "@/services/api/sessions";
export { getStatus } from "@/services/api/status";
export { ApiError, type ApiErrorParams } from "@/services/api/utils/apiError";
export {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "@/services/api/utils/authToken";
