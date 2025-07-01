import { handleApiError, logError, retryOperation } from "./errorUtils";

/**
 * Wrapper for fetch with unified error handling and optional retries.
 * @param input - fetch input
 * @param init - fetch init
 * @param options - { retries?: number }
 * @returns {Promise<Response>} The fetch response if successful
 * @throws {Error} User-friendly error if the request fails
 */
export async function fetchWithErrorHandling(
  input: RequestInfo,
  init?: RequestInit,
  options?: { retries?: number },
): Promise<Response> {
  try {
    return await retryOperation(
      async () => {
        const response = await fetch(input, init);
        if (!response.ok) {
          let errorMsg = `API request failed: ${response.status}`;
          try {
            const data = await response.json();
            if (data && data.error) errorMsg = data.error;
          } catch {
            // ignore JSON parse errors
          }
          throw new Error(errorMsg);
        }
        return response;
      },
      { retries: options?.retries ?? 0 },
    );
  } catch (error) {
    logError(error, "fetchWithErrorHandling");
    throw new Error(handleApiError(error));
  }
}
