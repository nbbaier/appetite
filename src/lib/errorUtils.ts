// Error handling utilities for frontend use

/**
 * Standardizes API error processing and returns a user-friendly message.
 * @param error - The error object from fetch, axios, or Supabase
 * @returns {string} User-friendly error message
 */
export function handleApiError(error: unknown): string {
  if (!error) {
    return "An unknown error occurred.";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
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
 * Logs errors to the console and triggers any global notification handler.
 * @param error - The error object
 * @param context - Optional context string for where the error occurred
 */
export function logError(error: unknown, context?: string) {
  if (context) {
    console.error(`[Error][${context}]`, error);
  } else {
    console.error("[Error]", error);
  }

  // If a global notify is available (set by NotificationProvider), use it
  if (
    typeof window !== "undefined" &&
    typeof (
      window as unknown as { notify?: (msg: string, opts?: unknown) => void }
    ).notify === "function"
  ) {
    let message = "An error occurred.";
    if (typeof error === "string") {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
    }
    (
      window as unknown as { notify: (msg: string, opts?: unknown) => void }
    ).notify(message, { type: "error" });
  }
}
