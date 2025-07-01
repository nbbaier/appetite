import { ChefHat, Sparkles } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

const features = [
  {
    title: "Smart Recipe Suggestions",
    description:
      "Get personalized recipe ideas based on your pantry and preferences.",
  },
  {
    title: "Pantry Management",
    description: "Track what you have, what's expiring, and reduce food waste.",
  },
  {
    title: "Shopping Lists",
    description: "Easily create, manage, and share shopping lists.",
  },
  {
    title: "AI Chat Assistant",
    description: "Ask anything about recipes, ingredients, or meal planning.",
  },
  {
    title: "Food Waste Reduction",
    description: "Use leftovers and optimize your grocery spending.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="flex flex-col items-center px-4 py-6 w-full bg-gradient-to-b from-green-100 to-white sm:py-10">
        <div className="flex relative justify-center items-center mb-4 w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg sm:w-20 sm:h-20">
          <ChefHat className="w-6 h-6 text-white sm:w-10 sm:h-10" />
          <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-yellow-300 animate-pulse sm:w-5 sm:h-5" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-center text-green-800 sm:text-4xl">
          Appetite: Smarter Cooking, Less Waste
        </h1>
        <p className="mb-6 max-w-md text-base text-center text-gray-700 sm:max-w-xl sm:text-lg">
          Discover delicious recipes, manage your pantry, and reduce food waste
          with AI-powered assistance.
        </p>
        <Button
          className="px-8 py-3 mt-2 w-full text-base sm:w-auto sm:text-lg"
          asChild
        >
          <a href="/signup">Get Started</a>
        </Button>
        <a
          href="/signin"
          className="mt-2 w-full text-sm text-center text-emerald-700 hover:underline sm:w-auto"
        >
          Already have an account? Sign in
        </a>
      </header>

      <main className="flex flex-col flex-1 items-center px-2 sm:px-4">
        <section className="mt-8 mb-8 w-full max-w-2xl sm:mt-12 sm:max-w-4xl">
          <h2 className="mb-6 text-xl font-semibold text-center sm:text-2xl">
            Features
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="flex flex-col items-start p-4 w-full sm:p-6"
              >
                <Badge className="mb-2">{feature.title}</Badge>
                <div className="text-sm text-gray-800 sm:text-base">
                  {feature.description}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Logo Bar: Add logos here */}
      <div className="flex flex-col items-center mt-2 mb-6">
        <span className="mb-2 text-xs tracking-wide text-gray-500 uppercase">
          Built with
        </span>
        <div className="flex flex-wrap gap-6 justify-center items-center">
          <img
            src="/bolt-badge/black_circle_360x360/black_circle_360x360.svg"
            alt="Bolt Badge"
            className="h-8"
          />
          <img
            src="/anthropic/logo-color.svg"
            alt="Anthropic Logo"
            className="h-8"
          />
          <img
            src="/entri/wordmark-color.svg"
            alt="Entri Wordmark"
            className="h-6"
          />
          <img
            src="/netlify/logo-black.svg"
            alt="Netlify Logo"
            className="h-7"
          />
          <img
            src="/supabase/logo-color.svg"
            alt="Supabase Logo"
            className="h-8"
          />
        </div>
      </div>

      <footer className="flex flex-col items-center px-2 py-4 mt-auto w-full bg-gray-100 sm:py-6">
        <div className="text-xs text-center text-gray-400">
          &copy; {new Date().getFullYear()} Appetite. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
