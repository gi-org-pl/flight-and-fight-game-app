/** Query-string key carrying a session id for auto-join deep links. */
export const JOIN_ID_PARAM = "join_id";

/**
 * Reads the `join_id` deep-link param from a location search string, returning
 * a trimmed non-empty id or `null`. Drives the auto-join: when present, the
 * game routes straight into the connect scene and joins that session.
 */
export const readJoinId = (search: string): string | null => {
  const id = new URLSearchParams(search).get(JOIN_ID_PARAM)?.trim();

  return id ? id : null;
};
