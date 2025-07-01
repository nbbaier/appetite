// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ChatProvider, useChat, useChatDispatch } from "./ChatContext";

function TestComponent() {
  const state = useChat();
  const dispatch = useChatDispatch();
  return (
    <>
      <div data-testid="inputValue">{state.inputValue}</div>
      <button
        onClick={() => dispatch({ type: "SET_INPUT", payload: "hello" })}
        data-testid="set-input"
      >
        Set Input
      </button>
    </>
  );
}

describe("ChatContext", () => {
  it("throws if useChat is used outside provider", () => {
    function Wrapper() {
      useChat();
      return null;
    }
    expect(() => render(<Wrapper />)).toThrow();
  });

  it("throws if useChatDispatch is used outside provider", () => {
    function Wrapper() {
      useChatDispatch();
      return null;
    }
    expect(() => render(<Wrapper />)).toThrow();
  });

  it("provides initial state and dispatch", () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>,
    );
    expect(screen.getByTestId("inputValue").textContent).toBe("");
  });

  it("updates state via dispatch", async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>,
    );
    const btn = screen.getByTestId("set-input");
    btn.click();
    await waitFor(() => {
      expect(screen.getByTestId("inputValue").textContent).toBe("hello");
    });
  });

  it("handles all reducer actions", () => {
    function ReducerTest() {
      const state = useChat();
      const dispatch = useChatDispatch();
      React.useEffect(() => {
        dispatch({
          type: "SET_MESSAGES",
          payload: [
            { id: "1", type: "user", content: "hi", timestamp: new Date() },
          ],
        });
        dispatch({
          type: "ADD_MESSAGE",
          payload: {
            id: "2",
            type: "ai",
            content: "hello",
            timestamp: new Date(),
          },
        });
        dispatch({ type: "SET_INPUT", payload: "test" });
        dispatch({ type: "SET_TYPING", payload: true });
        dispatch({ type: "CLEAR_CONVERSATION" });
        dispatch({ type: "SET_CONVERSATION", payload: "conv1" });
      }, [dispatch]);
      return (
        <div data-testid="activeConversationId">
          {state.activeConversationId}
        </div>
      );
    }
    render(
      <ChatProvider>
        <ReducerTest />
      </ChatProvider>,
    );
    expect(screen.getByTestId("activeConversationId").textContent).toBe(
      "conv1",
    );
  });
});
