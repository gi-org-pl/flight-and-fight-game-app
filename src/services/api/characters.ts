import { apiClient } from "@/services/api/client/apiClient";
import {
  type CharacterResponse,
  characterResponseSchema,
} from "@/services/api/schemas/character";
import { validateResponse } from "@/services/api/utils/validateResponse";
import { z } from "zod";

const characterListSchema = z.array(characterResponseSchema);

/** `GET /characters` — lists all available characters. */
export const getCharacters = async (): Promise<CharacterResponse[]> => {
  const { data } = await apiClient.get<unknown>("/characters");

  return validateResponse(characterListSchema, data);
};

/** `GET /my-characters` — returns the current player's selected characters. Requires auth token. */
export const getMyCharacters = async (): Promise<CharacterResponse[]> => {
  const { data } = await apiClient.get<unknown>("/my-characters");

  return validateResponse(characterListSchema, data);
};
