import { Bot, Clock, User } from "lucide-react";
import type React from "react";
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
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${message.type === "user" ? "ml-2 bg-blue-500 text-white" : "mr-2 bg-emerald-500 text-white"}`}
      >
        {message.type === "user" ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      {/* Message Content */}
      <div
        className={`rounded-lg px-4 py-2 ${message.type === "user" ? "bg-blue-500 text-white" : "border border-gray-200 bg-white text-gray-900"}`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </p>
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
                    height={48}
                    src={
                      recipe.image_url ||
                      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
                    }
                    width={48}
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
                onClick={() => onSuggestionClick(suggestion)}
                type="button"
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
