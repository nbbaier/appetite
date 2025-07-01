import {
  Bot,
  ChefHat,
  Clock,
  Heart,
  Lightbulb,
  Package,
  Pencil,
  Send,
  Trash,
  User,
  Utensils,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../../contexts/AuthContext";
import {
  ChatProvider,
  useChat,
  useChatDispatch,
} from "../../contexts/ChatContext";
import { useNotification } from "../../contexts/NotificationContext";
import {
  chatMessageService,
  conversationService,
  ingredientService,
  recipeService,
  userPreferencesService,
} from "../../lib/database";
import { handleApiError } from "../../lib/errorUtils";
import type {
  Conversation,
  Ingredient,
  Recipe,
  UserPreferences,
} from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

export interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  recipes?: Recipe[];
}

interface APIError {
  code: string;
  message: string;
  requestId?: string;
  details?: unknown;
}

// API response types
export interface ChatAPIResponse {
  message: string;
  usage?: unknown;
  requestId?: string;
  error?: APIError;
}

const QUICK_PROMPTS = [
  {
    icon: ChefHat,
    text: "What can I cook tonight?",
    category: "recipes",
  },
  {
    icon: Package,
    text: "What's expiring soon?",
    category: "pantry",
  },
  {
    icon: Lightbulb,
    text: "Suggest a healthy meal",
    category: "suggestions",
  },
  {
    icon: Clock,
    text: "Quick 15-minute recipes",
    category: "time",
  },
  {
    icon: Heart,
    text: "Comfort food ideas",
    category: "mood",
  },
  {
    icon: Utensils,
    text: "Help me meal prep",
    category: "planning",
  },
];

// Add a mapping for user-friendly error messages
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

export function AIChat() {
  const { user } = useAuth();
  const chatState = useChat();
  const dispatch = useChatDispatch();
  const { messages, inputValue, isTyping, activeConversationId } = chatState;

  const [_conversations, setConversations] = useState<Conversation[]>([]);
  const [_loadingConversations, setLoadingConversations] = useState(false);
  const [_loadingMessages, setLoadingMessages] = useState(false);
  const [userIngredients, setUserIngredients] = useState<Ingredient[]>([]);
  const [_availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [userPreferences, setUserPreferences] =
    useState<UserPreferences | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState<APIError | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const { notify } = useNotification();

  const loadUserData = useCallback(async () => {
    if (!user) return;

    try {
      const [ingredients, recipes, preferences] = await Promise.all([
        ingredientService.getAll(user.id),
        recipeService.getAll(),
        userPreferencesService.getPreferences(user.id),
      ]);
      setUserIngredients(ingredients);
      setAvailableRecipes(recipes);
      setUserPreferences(preferences);
    } catch (error) {
      console.error("Error loading user data:", error);
      notify(handleApiError(error), { type: "error" });
    }
  }, [user, notify]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const convs = await conversationService.getAll(user.id);
      setConversations(convs);
      if (convs.length > 0) {
        dispatch({ type: "SET_CONVERSATION", payload: convs[0].id });
      } else {
        // If no conversations, create one
        try {
          const newConv = await conversationService.create(user.id, null);
          setConversations([newConv]);
          dispatch({ type: "SET_CONVERSATION", payload: newConv.id });
        } catch (err) {
          setError({
            code: "conversation_create_error",
            message: handleApiError(err),
          });
          notify(handleApiError(err), { type: "error" });
        }
      }
    } catch (err) {
      setError({
        code: "conversation_load_error",
        message: handleApiError(err),
      });
      notify(handleApiError(err), { type: "error" });
    } finally {
      setLoadingConversations(false);
    }
  }, [user, dispatch, notify]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setLoadingMessages(true);
      try {
        const supaMessages = await chatMessageService.getAll(conversationId);
        dispatch({
          type: "SET_MESSAGES",
          payload: supaMessages.map((msg) => ({
            id: msg.id,
            type: msg.sender,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            suggestions: msg.suggestions || undefined,
            recipes: msg.recipes || undefined,
          })),
        });
      } catch (err) {
        setError({
          code: "message_load_error",
          message: handleApiError(err),
        });
        notify(handleApiError(err), { type: "error" });
      } finally {
        setLoadingMessages(false);
      }
    },
    [dispatch, notify],
  );

  useEffect(() => {
    if (user) {
      loadUserData();
      loadConversations();
      // Add welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        type: "ai",
        content: `Hello! I'm your AI cooking assistant. I can help you discover recipes based on your pantry, suggest meals, and answer cooking questions. What would you like to cook today?`,
        timestamp: new Date(),
        suggestions: [
          "Show me recipes I can make",
          "What's expiring in my pantry?",
          "Suggest a healthy dinner",
          "Help me plan meals for the week",
        ],
      };
      dispatch({ type: "SET_MESSAGES", payload: [welcomeMessage] });
    }
  }, [user, loadUserData, loadConversations, dispatch]);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId, loadMessages]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, []);

  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    setError(null);
    try {
      const conversationMessages = messages
        .filter((msg) => msg.type !== "ai" || !msg.suggestions)
        .map((msg) => ({
          role:
            msg.type === "user" ? ("user" as const) : ("assistant" as const),
          content: msg.content,
        }));
      conversationMessages.push({
        role: "user" as const,
        content: userMessage,
      });
      const ingredientNames = userIngredients.map((ing) => ing.name);
      const userContext = {
        userIngredients: ingredientNames,
        userPreferences: userPreferences
          ? {
              dietary_restrictions: userPreferences.dietary_restrictions,
              allergies: userPreferences.allergies,
              cooking_skill_level: userPreferences.cooking_skill_level,
            }
          : undefined,
      };
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: conversationMessages,
            ...userContext,
          }),
        },
      );
      if (!response.ok) {
        let data: ChatAPIResponse;
        try {
          data = (await response.json()) as ChatAPIResponse;
        } catch {
          data = {
            message: "",
            error: {
              code: "http_error",
              message: `API request failed: ${response.status}`,
            },
          };
        }
        const apiError: APIError = data.error || {
          code: "http_error",
          message: `API request failed: ${response.status}`,
        };
        setError({
          code: apiError.code,
          message: handleApiError(apiError),
        });
        notify(handleApiError(apiError), { type: "error" });
        throw new Error(apiError.message);
      }
      const data = (await response.json()) as ChatAPIResponse;
      if (data.error && typeof data.error === "object") {
        const apiError: APIError = {
          code: data.error.code || "api_error",
          message: data.error.message || "Unknown error from AI backend.",
          requestId: data.error.requestId,
          details: data.error.details,
        };
        setError({
          code: apiError.code,
          message: handleApiError(apiError),
        });
        notify(handleApiError(apiError), { type: "error" });
        throw new Error(apiError.message);
      }
      const aiContent = data.message;
      let suggestions: string[] = [];
      let recipes: Recipe[] = [];
      if (
        aiContent.toLowerCase().includes("recipe") ||
        aiContent.toLowerCase().includes("cook")
      ) {
        suggestions = [
          "Show me more recipes",
          "What about vegetarian options?",
          "I want something quick",
          "Help me plan meals for the week",
        ];
      } else if (
        aiContent.toLowerCase().includes("ingredient") ||
        aiContent.toLowerCase().includes("pantry")
      ) {
        suggestions = [
          "What can I cook with these ingredients?",
          "How should I store these ingredients?",
          "What's a good substitute for this ingredient?",
          "Help me use up leftovers",
        ];
      } else {
        suggestions = [
          "What can I cook tonight?",
          "Suggest a recipe for dinner",
          "Help me meal prep",
          "What's expiring in my pantry?",
        ];
      }
      if (
        aiContent.toLowerCase().includes("recipe") &&
        userIngredients.length > 0
      ) {
        const ingredientNames = userIngredients.map((ing) => ing.name);
        const canCookRecipes = await recipeService.getCanCook(ingredientNames);
        recipes = canCookRecipes.slice(0, 2);
      }
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        type: "ai",
        content: aiContent,
        timestamp: new Date(),
        suggestions,
        recipes,
      };
      if (activeConversationId) {
        try {
          await chatMessageService.create(
            activeConversationId,
            "ai",
            aiContent,
            suggestions,
            recipes,
          );
        } catch (err) {
          setError({
            code: "message_create_error",
            message: handleApiError(err),
          });
          notify(handleApiError(err), { type: "error" });
        }
      }
      dispatch({ type: "ADD_MESSAGE", payload: aiMsg });
      return aiMsg;
    } catch (err) {
      setError({
        code: "ai_response_error",
        message: handleApiError(err),
      });
      notify(handleApiError(err), { type: "error" });
      throw err;
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      content: text,
      timestamp: new Date(),
    };
    dispatch({ type: "ADD_MESSAGE", payload: userMsg });
    dispatch({ type: "SET_INPUT", payload: "" });
    dispatch({ type: "SET_TYPING", payload: true });
    setLastUserMessage(text);
    if (activeConversationId) {
      try {
        await chatMessageService.create(activeConversationId, "user", text);
      } catch (err) {
        setError({
          code: "message_create_error",
          message: handleApiError(err),
        });
        notify(handleApiError(err), { type: "error" });
      }
    }
    try {
      const aiResponse = await generateAIResponse(text);
      dispatch({ type: "ADD_MESSAGE", payload: aiResponse });
    } catch (error) {
      console.error("Error generating AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      dispatch({ type: "ADD_MESSAGE", payload: errorMessage });
    } finally {
      dispatch({ type: "SET_TYPING", payload: false });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    // Allow Shift+Enter for new lines (default textarea behavior)
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
      {/* Conversation Selector Header */}
      <div className="flex overflow-x-auto gap-2 items-center px-4 py-2 bg-white border-b border-border">
        <Button
          variant="outline"
          className="shrink-0"
          onClick={async () => {
            if (!user) return;
            try {
              const newConv = await conversationService.create(user.id, null);
              setConversations((prev) => [newConv, ...prev]);
              dispatch({ type: "SET_CONVERSATION", payload: newConv.id });
              dispatch({ type: "SET_MESSAGES", payload: [] });
            } catch (err) {
              setError({
                code: "conversation_create_error",
                message: handleApiError(err),
              });
              notify(handleApiError(err), { type: "error" });
            }
          }}
        >
          + New Conversation
        </Button>
        <div className="flex overflow-x-auto gap-2">
          {_conversations.map((conv: Conversation, idx: number) => (
            <div key={conv.id} className="flex relative items-center group">
              <Button
                variant={
                  conv.id === activeConversationId ? "default" : "outline"
                }
                className={`shrink-0 ${conv.id === activeConversationId ? "font-bold" : ""}`}
                onClick={() =>
                  dispatch({ type: "SET_CONVERSATION", payload: conv.id })
                }
              >
                {conv.title || "Untitled"}
                <span className="ml-2 text-xs text-gray-400">
                  {new Date(conv.updated_at).toLocaleDateString()}
                </span>
              </Button>
              <button
                className="absolute right-10 top-1/2 p-1 opacity-0 transition-opacity -translate-y-1/2 group-hover:opacity-100"
                tabIndex={0}
                onClick={async (e) => {
                  e.stopPropagation();
                  const newTitle = window.prompt(
                    "Rename conversation",
                    conv.title || "Untitled",
                  );
                  if (newTitle !== null && newTitle.trim() !== "") {
                    try {
                      await conversationService.updateTitle(
                        conv.id,
                        newTitle.trim(),
                      );
                      setConversations((prev) =>
                        prev.map((c, i) =>
                          i === idx ? { ...c, title: newTitle.trim() } : c,
                        ),
                      );
                    } catch (err) {
                      setError({
                        code: "conversation_rename_error",
                        message: handleApiError(err),
                      });
                      notify(handleApiError(err), { type: "error" });
                    }
                  }
                }}
              >
                <Pencil className="w-4 h-4 text-gray-400 hover:text-blue-500" />
              </button>
              <button
                className="absolute right-2 top-1/2 p-1 opacity-0 transition-opacity -translate-y-1/2 group-hover:opacity-100"
                tabIndex={0}
                onClick={async (e) => {
                  e.stopPropagation();
                  if (window.confirm("Delete this conversation?")) {
                    try {
                      await conversationService.delete(conv.id);
                      setConversations((prev) =>
                        prev.filter((c) => c.id !== conv.id),
                      );
                      if (activeConversationId === conv.id) {
                        const next = _conversations.find(
                          (c) => c.id !== conv.id,
                        );
                        if (next) {
                          dispatch({
                            type: "SET_CONVERSATION",
                            payload: next.id,
                          });
                        } else if (user) {
                          try {
                            const newConv = await conversationService.create(
                              user.id,
                              null,
                            );
                            setConversations([newConv]);
                            dispatch({
                              type: "SET_CONVERSATION",
                              payload: newConv.id,
                            });
                            dispatch({ type: "SET_MESSAGES", payload: [] });
                          } catch (err) {
                            setError({
                              code: "conversation_create_error",
                              message: handleApiError(err),
                            });
                            notify(handleApiError(err), { type: "error" });
                          }
                        }
                      }
                    } catch (err) {
                      setError({
                        code: "conversation_delete_error",
                        message: handleApiError(err),
                      });
                      notify(handleApiError(err), { type: "error" });
                    }
                  }
                }}
              >
                <Trash className="w-4 h-4 text-gray-400 hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Prompts - Show when no messages or just welcome */}
      {messages.length <= 1 && (
        <div className="p-4 bg-gray-50 rounded-t-lg border-b border-border">
          <p className="mb-3 text-sm text-gray-600">Try asking me about:</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {QUICK_PROMPTS.map((prompt, index: number) => (
              <button
                key={index}
                onClick={() => handleSendMessage(prompt.text)}
                className="flex items-center p-2 space-x-2 text-sm text-left bg-white rounded-lg border border-gray-200 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
              >
                <prompt.icon className="flex-shrink-0 w-4 h-4 text-emerald-600" />
                <span className="truncate">{prompt.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message: Message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                } items-start space-x-2`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${
                    message.type === "user"
                      ? "bg-blue-500 text-white ml-2"
                      : "bg-emerald-500 text-white mr-2"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.type === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                  }`}
                >
                  {message.type === "ai" ? (
                    <ReactMarkdown className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}

                  {/* Recipe Cards */}
                  {message.recipes && message.recipes.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.recipes.map((recipe: Recipe) => (
                        <div
                          key={recipe.id}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                recipe.image_url ||
                                "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
                              }
                              alt={recipe.title}
                              className="object-cover flex-shrink-0 w-12 h-12 rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {recipe.title}
                              </h4>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {recipe.description}
                              </p>
                              <div className="flex items-center mt-1 space-x-2">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {recipe.prep_time + recipe.cook_time} min
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {recipe.difficulty}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {message.suggestions.map(
                        (suggestion: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => handleSendMessage(suggestion)}
                            className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-full transition-colors hover:bg-gray-200"
                          >
                            {suggestion}
                          </button>
                        ),
                      )}
                    </div>
                  )}

                  <p className="mt-2 text-xs opacity-70">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="flex justify-center items-center w-8 h-8 text-white bg-emerald-500 rounded-full">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-2 bg-white rounded-lg border border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white rounded-b-lg border-t border-border">
        <div className="flex space-x-2">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) =>
              dispatch({ type: "SET_INPUT", payload: e.target.value })
            }
            onKeyDown={handleKeyPress}
            placeholder="Ask me about recipes, ingredients, or cooking tips..."
            className="flex-1 min-h-[40px] max-h-[120px] resize-none overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            rows={1}
            disabled={isTyping}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isTyping}
            className="px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="mt-2 text-xs text-center text-gray-500">
          Powered by OpenAI GPT-4.1. Press Enter to send, Shift+Enter for new
          line.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex flex-col gap-1 p-2 mb-2 text-red-700 bg-red-100 rounded ai-chat-error">
          <div>
            <strong>Error:</strong>{" "}
            {ERROR_MESSAGES[error.code] || error.message}
            {error.code && (
              <span className="ml-2 text-xs">(Code: {error.code})</span>
            )}
            {error.requestId && (
              <span className="ml-2 text-xs">
                Request ID: {error.requestId}
              </span>
            )}
          </div>
          <div>
            <span>What can you do?</span>
            <ul className="ml-5 text-sm list-disc">
              <li>Check your internet connection.</li>
              <li>Try rephrasing your message or sending it again.</li>
              <li>
                If the problem persists, contact support and provide the Request
                ID above.
              </li>
            </ul>
          </div>
          {lastUserMessage && (
            <Button
              variant="outline"
              className="mt-1 w-fit"
              onClick={() => {
                setError(null);
                dispatch({ type: "SET_INPUT", payload: lastUserMessage || "" });
                // Optionally, auto-resend the message:
                // handleSendMessage(lastUserMessage);
              }}
            >
              Retry
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AIChatWithProvider() {
  return (
    <ChatProvider>
      <AIChat />
    </ChatProvider>
  );
}

export type { Recipe };
