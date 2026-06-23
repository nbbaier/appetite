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
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex w-full flex-col items-center bg-linear-to-b from-green-100 to-white px-4 py-6 sm:py-10">
        <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-600 shadow-lg sm:h-20 sm:w-20">
          <ChefHat className="h-6 w-6 text-white sm:h-10 sm:w-10" />
          <Sparkles className="absolute -top-2 -right-2 h-4 w-4 animate-pulse text-yellow-300 sm:h-5 sm:w-5" />
        </div>
        <h1 className="mb-2 text-center font-bold text-green-800 text-xl sm:text-4xl">
          Appetite: Smarter Cooking, Less Waste
        </h1>
        <p className="mb-6 max-w-md text-center text-base text-gray-700 sm:max-w-xl sm:text-lg">
          Discover delicious recipes, manage your pantry, and reduce food waste
          with AI-powered assistance.
        </p>
        <Button
          asChild
          className="mt-2 w-full px-8 py-3 text-base sm:w-auto sm:text-lg"
        >
          <a href="/signup">Get Started</a>
        </Button>
        <a
          className="mt-2 w-full text-center text-emerald-700 text-sm hover:underline sm:w-auto"
          href="/signin"
        >
          Already have an account? Sign in
        </a>
      </header>

      <main className="flex flex-1 flex-col items-center px-2 sm:px-4">
        <section className="mt-8 mb-8 w-full max-w-2xl sm:mt-12 sm:max-w-4xl">
          <h2 className="mb-6 text-center font-semibold text-xl sm:text-2xl">
            Features
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                className="flex w-full flex-col items-start p-4 sm:p-6"
                key={feature.title}
              >
                <Badge className="mb-2">{feature.title}</Badge>
                <div className="text-gray-800 text-sm sm:text-base">
                  {feature.description}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Logo Bar: Add logos here */}
      <div className="mt-2 mb-6 flex flex-col items-center">
        <span className="mb-2 text-gray-500 text-xs uppercase tracking-wide">
          Built with
        </span>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <img
            alt="Bolt Badge"
            className="h-8"
            src="/bolt-badge/black_circle_360x360/black_circle_360x360.svg"
          />
          <img
            alt="Anthropic Logo"
            className="h-8"
            src="/anthropic/logo-color.svg"
          />
          <img
            alt="Entri Wordmark"
            className="h-6"
            src="/entri/wordmark-color.svg"
          />
          <img
            alt="Netlify Logo"
            className="h-7"
            src="/netlify/logo-black.svg"
          />
          <img
            alt="Supabase Logo"
            className="h-8"
            src="/supabase/logo-color.svg"
          />
        </div>
      </div>

      <footer className="mt-auto flex w-full flex-col items-center bg-gray-100 px-2 py-4 sm:py-6">
        <div className="text-center text-gray-400 text-xs">
          &copy; {new Date().getFullYear()} Appetite. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
