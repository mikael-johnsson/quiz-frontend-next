/**
 * Validates that a required environment URL exists and uses HTTPS.
 */
export const getRequiredHttpsUrl = (
  value: string | undefined,
  envName: string,
) => {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    throw new Error(`${envName} is missing. Add it to your .env file.`);
  }

  if (!trimmed.startsWith("https://")) {
    throw new Error(`${envName} must start with https://`);
  }

  return trimmed;
};

/**
 * Tries to extract a readable error from JSON/text body, then falls back to status map.
 */
export const getErrorMessage = async (
  res: Response,
  fallbackMessage: string,
  statusMessages: Record<number, string> = {},
) => {
  const mappedStatusMessage = statusMessages[res.status];
  const contentType = res.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const json = (await res.json()) as { message?: string; error?: string };
      const jsonMessage = json.message ?? json.error;

      if (jsonMessage && jsonMessage.trim().length > 0) {
        return jsonMessage;
      }
    } else {
      const text = await res.text();
      if (text.trim().length > 0) {
        return text;
      }
    }
  } catch {
    // Fall back to status-based or generic message when body parsing fails.
  }

  return mappedStatusMessage ?? fallbackMessage;
};
