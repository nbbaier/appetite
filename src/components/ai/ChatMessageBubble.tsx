import { Bot, Clock, User } from "lucide-react";
import React from "react";
import { Badge } from "../ui/badge";
import type { Message, Recipe } from "./AIChat";

interface ChatMessageBubbleProps {
  message: Message;
  onSuggestionClick: (suggestion: string) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onSuggestionClick,
}) => (
  <div
    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
  >
    <div
      className={`flex max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"} items-start space-x-2`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${message.type === "user" ? "bg-blue-500 text-white ml-2" : "bg-emerald-500 text-white mr-2"}`}
      >
        {message.type === "user" ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>
      {/* Message Content */}
      <div
        className={`rounded-lg px-4 py-2 ${message.type === "user" ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
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
            {message.suggestions.map((suggestion: string, index: number) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-full transition-colors hover:bg-gray-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs opacity-70">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  </div>
);
