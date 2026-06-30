import AIChatWithProvider from "../components/ai/AIChat";

export function Assistant() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="font-bold text-secondary-900 text-xl sm:text-2xl">
          AI Cooking Assistant
        </h1>
        <p className="text-secondary-600 text-sm sm:text-base">
          Get personalized recipe suggestions and cooking advice powered by AI
        </p>
      </div>

      <AIChatWithProvider />
    </div>
  );
}
