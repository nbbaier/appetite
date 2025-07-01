const categorizeCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface CategorizeRequest {
  ingredientName: string;
  userHistory?: Array<{ name: string; category: string }>;
}

interface CategorizeResponse {
  category: string;
  confidence: number;
  suggestions?: string[];
  error?: string;
}
// @ts-ignore
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: categorizeCorsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: {
          ...categorizeCorsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // Get the OpenAI API key from environment variables
    // @ts-ignore
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: {
            ...categorizeCorsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Parse the request body
    const { ingredientName, userHistory }: CategorizeRequest = await req.json();

    if (!ingredientName || typeof ingredientName !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid ingredient name" }),
        {
          status: 400,
          headers: {
            ...categorizeCorsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Create context from user history
    let historyContext = "";
    if (userHistory && userHistory.length > 0) {
      historyContext = `\n\nUser's categorization history for reference:\n${userHistory
        .map((item) => `- ${item.name}: ${item.category}`)
        .join("\n")}`;
    }

    // Create the system message for categorization
    const systemMessage = `You are a helpful assistant that categorizes food ingredients into appropriate categories.

Available categories:
- Vegetables: Fresh vegetables, herbs, leafy greens
- Fruits: Fresh fruits, berries, citrus
- Meat: All meat, poultry, seafood, fish
- Dairy: Milk, cheese, yogurt, butter, cream
- Grains: Rice, pasta, bread, flour, cereals, oats
- Spices: Herbs, spices, seasonings, extracts
- Condiments: Sauces, dressings, oils, vinegars, spreads
- Other: Items that don't fit other categories

Your task is to categorize the given ingredient and return a JSON response with:
- category: The most appropriate category from the list above
- confidence: A number from 0.0 to 1.0 indicating how confident you are
- suggestions: Optional array of alternative categories if confidence is low

Consider the user's history to maintain consistency with their preferences.${historyContext}

Example response:
{
  "category": "Vegetables",
  "confidence": 0.95,
  "suggestions": []
}`;

    const userMessage = `Categorize this ingredient: "${ingredientName}"`;

    // Make request to OpenAI API
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini-2025-04-14",
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage },
          ],
          temperature: 0.1,
          max_tokens: 200,
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to categorize ingredient" }),
        {
          status: 500,
          headers: {
            ...categorizeCorsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const openaiData = await openaiResponse.json();

    // Extract the assistant's response
    const assistantMessage = openaiData.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500,
        headers: {
          ...categorizeCorsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // Parse the JSON response
    let parsedResponse: CategorizeResponse;
    try {
      parsedResponse = JSON.parse(assistantMessage);
    } catch (_error) {
      console.error("Failed to parse AI response as JSON:", assistantMessage);
      return new Response(
        JSON.stringify({ error: "Invalid response format from AI" }),
        {
          status: 500,
          headers: {
            ...categorizeCorsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Validate the response
    const validCategories = [
      "Vegetables",
      "Fruits",
      "Meat",
      "Dairy",
      "Grains",
      "Spices",
      "Condiments",
      "Other",
    ];
    if (!validCategories.includes(parsedResponse.category)) {
      parsedResponse.category = "Other";
      parsedResponse.confidence = 0.5;
    }

    // Return the validated response
    return new Response(
      JSON.stringify({
        category: parsedResponse.category,
        confidence: parsedResponse.confidence || 0.8,
        suggestions: parsedResponse.suggestions || [],
        usage: openaiData.usage,
      }),
      {
        status: 200,
        headers: {
          ...categorizeCorsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Categorize ingredient function error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...categorizeCorsHeaders, "Content-Type": "application/json" },
    });
  }
});
