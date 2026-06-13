import { apiClient } from "@/services/api/client/apiClient";
import {
  type GetSessionResponse,
  getSessionResponseSchema,
  type SessionCredentialsResponse,
  sessionCredentialsResponseSchema,
} from "@/services/api/schemas/session";
import { validateResponse } from "@/services/api/utils/validateResponse";

/** `POST /sessions` — creates a new session as the first player. */
export const createSession = async (): Promise<SessionCredentialsResponse> => {
  const { data } = await apiClient.post<unknown>("/sessions");

  return validateResponse(sessionCredentialsResponseSchema, data);
};

/** `POST /sessions/{code}/join` — joins an open session as the second player using the last 8 characters of its id. */
export const joinSession = async (
  code: string,
): Promise<SessionCredentialsResponse> => {
  const { data } = await apiClient.post<unknown>(`/sessions/${code}/join`);

  return validateResponse(sessionCredentialsResponseSchema, data);
};

/** `GET /sessions/{id}` — returns the current state of a session. */
export const getSession = async (
  sessionId: string,
): Promise<GetSessionResponse> => {
  const { data } = await apiClient.get<unknown>(`/sessions/${sessionId}`);

  return validateResponse(getSessionResponseSchema, data);
};
