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
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  content: string;
  id: string;
  recipes?: Recipe[];
  suggestions?: string[];
  timestamp: Date;
  type: "user" | "ai";
}

interface APIError {
  code: string;
  details?: unknown;
  message: string;
  requestId?: string;
}

// API response types
export interface ChatAPIResponse {
  error?: APIError;
  message: string;
  requestId?: string;
  usage?: unknown;
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
    if (!user) {
      return;
    }

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
    if (!user) {
      return;
    }
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
    [dispatch, notify]
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
        "[data-radix-scroll-area-viewport]"
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
        }
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
            recipes
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
    if (!text) {
      return;
    }
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

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="mx-auto flex h-[calc(100vh-200px)] max-w-4xl flex-col">
      {/* Conversation Selector Header */}
      <div className="flex items-center gap-2 overflow-x-auto border-border border-b bg-white px-4 py-2">
        <Button
          className="shrink-0"
          onClick={async () => {
            if (!user) {
              return;
            }
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
          variant="outline"
        >
          + New Conversation
        </Button>
        <div className="flex gap-2 overflow-x-auto">
          {_conversations.map((conv: Conversation, idx: number) => (
            <div className="group relative flex items-center" key={conv.id}>
              <Button
                className={`shrink-0 ${conv.id === activeConversationId ? "font-bold" : ""}`}
                onClick={() =>
                  dispatch({ type: "SET_CONVERSATION", payload: conv.id })
                }
                variant={
                  conv.id === activeConversationId ? "default" : "outline"
                }
              >
                {conv.title || "Untitled"}
                <span className="ml-2 text-gray-400 text-xs">
                  {new Date(conv.updated_at).toLocaleDateString()}
                </span>
              </Button>
              <button
                className="absolute top-1/2 right-10 -translate-y-1/2 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={async (e) => {
                  e.stopPropagation();
                  const newTitle = window.prompt(
                    "Rename conversation",
                    conv.title || "Untitled"
                  );
                  if (newTitle !== null && newTitle.trim() !== "") {
                    try {
                      await conversationService.updateTitle(
                        conv.id,
                        newTitle.trim()
                      );
                      setConversations((prev) =>
                        prev.map((c, i) =>
                          i === idx ? { ...c, title: newTitle.trim() } : c
                        )
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
                tabIndex={0}
                type="button"
              >
                <Pencil className="h-4 w-4 text-gray-400 hover:text-blue-500" />
              </button>
              <button
                className="absolute top-1/2 right-2 -translate-y-1/2 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (window.confirm("Delete this conversation?")) {
                    try {
                      await conversationService.delete(conv.id);
                      setConversations((prev) =>
                        prev.filter((c) => c.id !== conv.id)
                      );
                      if (activeConversationId === conv.id) {
                        const next = _conversations.find(
                          (c) => c.id !== conv.id
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
                              null
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
                tabIndex={0}
                type="button"
              >
                <Trash className="h-4 w-4 text-gray-400 hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Prompts - Show when no messages or just welcome */}
      {messages.length <= 1 && (
        <div className="rounded-t-lg border-border border-b bg-gray-50 p-4">
          <p className="mb-3 text-gray-600 text-sm">Try asking me about:</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-white p-2 text-left text-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50"
                key={prompt.text}
                onClick={() => handleSendMessage(prompt.text)}
                type="button"
              >
                <prompt.icon className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="truncate">{prompt.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message: Message) => (
            <div
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              key={message.id}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                } items-start space-x-2`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    message.type === "user"
                      ? "ml-2 bg-blue-500 text-white"
                      : "mr-2 bg-emerald-500 text-white"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.type === "user"
                      ? "bg-blue-500 text-white"
                      : "border border-gray-200 bg-white text-gray-900"
                  }`}
                >
                  {message.type === "ai" ? (
                    <ReactMarkdown className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                  )}

                  {/* Recipe Cards */}
                  {message.recipes && message.recipes.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.recipes.map((recipe: Recipe) => (
                        <div
                          className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                          key={recipe.id}
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              alt={recipe.title}
                              className="h-12 w-12 shrink-0 rounded-lg object-cover"
                              src={
                                recipe.image_url ||
                                "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
                              }
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate font-medium text-gray-900 text-sm">
                                {recipe.title}
                              </h4>
                              <p className="line-clamp-2 text-gray-600 text-xs">
                                {recipe.description}
                              </p>
                              <div className="mt-1 flex items-center space-x-2">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-500 text-xs">
                                  {recipe.prep_time + recipe.cook_time} min
                                </span>
                                <Badge className="text-xs" variant="outline">
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
                    <div className="mt-3 flex flex-wrap gap-1">
                      {message.suggestions.map((suggestion: string) => (
                        <button
                          className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 text-xs transition-colors hover:bg-gray-200"
                          key={suggestion}
                          onClick={() => handleSendMessage(suggestion)}
                          type="button"
                        >
                          {suggestion}
                        </button>
                      ))}
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
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg border border-gray-200 bg-white px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="rounded-b-lg border-border border-t bg-white p-4">
        <div className="flex space-x-2">
          <textarea
            className="max-h-[120px] min-h-[40px] flex-1 resize-none overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isTyping}
            onChange={(e) =>
              dispatch({ type: "SET_INPUT", payload: e.target.value })
            }
            onKeyDown={handleKeyPress}
            placeholder="Ask me about recipes, ingredients, or cooking tips..."
            ref={textareaRef}
            rows={1}
            value={inputValue}
          />
          <Button
            className="px-4"
            disabled={!inputValue.trim() || isTyping}
            onClick={() => handleSendMessage()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-gray-500 text-xs">
          Powered by OpenAI GPT-4.1. Press Enter to send, Shift+Enter for new
          line.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="ai-chat-error mb-2 flex flex-col gap-1 rounded bg-red-100 p-2 text-red-700">
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
            <ul className="ml-5 list-disc text-sm">
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
              className="mt-1 w-fit"
              onClick={() => {
                setError(null);
                dispatch({ type: "SET_INPUT", payload: lastUserMessage || "" });
                // Optionally, auto-resend the message:
                // handleSendMessage(lastUserMessage);
              }}
              variant="outline"
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
