import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import type { ErrorInfo, ReactNode } from "react";

// Add error boundary for debugging
class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: unknown }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
    // Trigger global notification if available
    if (
      typeof window !== "undefined" &&
      typeof (window as unknown as { notify?: Function }).notify === "function"
    ) {
      (
        window as unknown as { notify: (msg: string, opts?: unknown) => void }
      ).notify(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
        { type: "error", description: "A critical error occurred in the app." },
      );
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
            color: "#dc2626",
          }}
        >
          <h1>Something went wrong</h1>
          <p>Check the browser console for more details.</p>
          <pre
            style={{
              background: "#f3f4f6",
              padding: "10px",
              borderRadius: "4px",
              textAlign: "left",
              fontSize: "12px",
              overflow: "auto",
            }}
          >
            {this.state.error ? this.state.error.toString() : ""}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} catch (error) {
  console.error("Failed to render app:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: system-ui, sans-serif; color: #dc2626;">
      <h1>Failed to load Appetite</h1>
      <p>Check the browser console for error details.</p>
    </div>
  `;
}
