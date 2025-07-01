// Error handling utilities for frontend use

/**
 * Standardizes API error processing and returns a user-friendly message.
 * @param error - The error object from fetch, axios, or Supabase
 * @returns {string} User-friendly error message
 */
export function handleApiError(error: unknown): string {
  if (!error) return "An unknown error occurred.";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  // Supabase error shape
  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;
    if ("message" in errObj && typeof errObj.message === "string") {
      return errObj.message;
    }
    if ("error" in errObj && typeof errObj.error === "string") {
      return errObj.error;
    }
    if ("code" in errObj && typeof errObj.code === "string") {
      return `Error code: ${errObj.code}`;
    }
  }
  return "An unexpected error occurred.";
}

/**
 * Logs errors to the console and optionally to a monitoring service.
 * @param error - The error object
 * @param context - Optional context string for where the error occurred
 */
export function logError(error: unknown, context?: string) {
  if (context) {
    console.error(`[Error][${context}]`, error);
  } else {
    console.error("[Error]", error);
  }
  // TODO: Integrate with external monitoring/logging service
  // TEMP: If a global notify is available (set by NotificationProvider), use it
  if (
    typeof window !== "undefined" &&
    typeof (
      window as unknown as { notify?: (msg: string, opts?: unknown) => void }
    ).notify === "function"
  ) {
    (
      window as unknown as { notify: (msg: string, opts?: unknown) => void }
    ).notify(
      typeof error === "string"
        ? error
        : error instanceof Error
          ? error.message
          : "An error occurred.",
      { type: "error" },
    );
  }
}

/**
 * Retries an async operation with exponential backoff.
 * @param fn - The async function to retry
 * @param options - Retry options (retries, initialDelay, maxDelay)
 */
export async function retryOperation<T>(
  fn: () => Promise<T>,
  options?: { retries?: number; initialDelay?: number; maxDelay?: number },
): Promise<T> {
  const retries = options?.retries ?? 3;
  const initialDelay = options?.initialDelay ?? 500;
  const maxDelay = options?.maxDelay ?? 4000;
  let attempt = 0;
  let delay = initialDelay;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt > retries) throw error;
      await new Promise((res) => setTimeout(res, delay));
      delay = Math.min(delay * 2, maxDelay);
    }
  }
}
