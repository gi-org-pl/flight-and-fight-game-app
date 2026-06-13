import { apiClient } from "@/services/api/client/apiClient";
import {
  type StatusResponse,
  statusResponseSchema,
} from "@/services/api/schemas/status";
import { validateResponse } from "@/services/api/utils/validateResponse";

/** `GET /` — returns the current application status. */
export const getStatus = async (): Promise<StatusResponse> => {
  const { data } = await apiClient.get<unknown>("/");

  return validateResponse(statusResponseSchema, data);
};
