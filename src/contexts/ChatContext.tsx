// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
} from "react";
import type { Message } from "../components/ai/AIChat";

// Chat State Types
export interface ChatState {
  messages: Message[];
  inputValue: string;
  isTyping: boolean;
  activeConversationId: string | null;
}

export type ChatAction =
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_INPUT"; payload: string }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "CLEAR_CONVERSATION" }
  | { type: "SET_CONVERSATION"; payload: string | null };

const initialState: ChatState = {
  messages: [],
  inputValue: "",
  isTyping: false,
  activeConversationId: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "SET_INPUT":
      return { ...state, inputValue: action.payload };
    case "SET_TYPING":
      return { ...state, isTyping: action.payload };
    case "CLEAR_CONVERSATION":
      return { ...state, messages: [] };
    case "SET_CONVERSATION":
      return { ...state, activeConversationId: action.payload, messages: [] };
    default:
      return state;
  }
}

const ChatStateContext = createContext<ChatState | undefined>(undefined);
const ChatDispatchContext = createContext<Dispatch<ChatAction> | undefined>(
  undefined,
);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  return (
    <ChatStateContext.Provider value={state}>
      <ChatDispatchContext.Provider value={dispatch}>
        {children}
      </ChatDispatchContext.Provider>
    </ChatStateContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatStateContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

export function useChatDispatch() {
  const context = useContext(ChatDispatchContext);
  if (context === undefined) {
    throw new Error("useChatDispatch must be used within a ChatProvider");
  }
  return context;
}
