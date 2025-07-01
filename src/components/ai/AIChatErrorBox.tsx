import React from "react";
import { Button } from "../ui/button";

interface APIError {
  code: string;
  message: string;
  requestId?: string;
  details?: unknown;
}

const ERROR_MESSAGES: Record<string, string> = {
  method_not_allowed:
    "The chat service is temporarily unavailable. Please try again later.",
  missing_api_key: "The AI service is not configured. Please contact support.",
  invalid_messages_format:
    "There was a problem with your message. Please try rephrasing it.",
  openai_api_error:
    "The AI service is having trouble responding. Please try again in a moment.",
  no_ai_response: "The AI did not return a response. Please try again.",
  internal_server_error:
    "An unexpected error occurred. Please try again or contact support if the problem persists.",
  http_error:
    "A network error occurred. Please check your connection and try again.",
  api_error: "An error occurred with the AI service. Please try again.",
};

interface AIChatErrorBoxProps {
  error: APIError;
  lastUserMessage: string | null;
  onRetry: () => void;
}

export const AIChatErrorBox: React.FC<AIChatErrorBoxProps> = ({
  error,
  lastUserMessage,
  onRetry,
}) => (
  <div className="flex flex-col gap-1 p-2 mb-2 text-red-700 bg-red-100 rounded ai-chat-error">
    <div>
      <strong>Error:</strong> {ERROR_MESSAGES[error.code] || error.message}
      {error.code && <span className="ml-2 text-xs">(Code: {error.code})</span>}
      {error.requestId && (
        <span className="ml-2 text-xs">Request ID: {error.requestId}</span>
      )}
    </div>
    <div>
      <span>What can you do?</span>
      <ul className="ml-5 text-sm list-disc">
        <li>Check your internet connection.</li>
        <li>Try rephrasing your message or sending it again.</li>
        <li>
          If the problem persists, contact support and provide the Request ID
          above.
        </li>
      </ul>
    </div>
    {lastUserMessage && (
      <Button variant="outline" className="mt-1 w-fit" onClick={onRetry}>
        Retry
      </Button>
    )}
  </div>
);
