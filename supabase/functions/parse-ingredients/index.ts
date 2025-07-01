const parseIngredientsCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ParseRequest {
  text: string;
}

interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

interface ParseResponse {
  ingredients: ParsedIngredient[];
  error?: string;
}

// @ts-ignore
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: parseIngredientsCorsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse the request body
    const { text }: ParseRequest = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Invalid text input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the system message for ingredient parsing
    const systemMessage = `You are a helpful assistant that parses natural language descriptions of food ingredients into structured JSON format.

Your task is to extract individual ingredients from the user's text and return them as a JSON object with an "ingredients" array.

Each ingredient should have:
- name: The ingredient name (capitalized, singular form when possible)
- quantity: A number (default to 1 if not specified)
- unit: The measurement unit (use standard units: g, kg, ml, l, cups, tbsp, tsp, pieces, cans, bottles, etc.; if not specified, use "pieces")
- category: One of these categories: "Vegetables", "Fruits", "Meat", "Dairy", "Grains", "Spices", "Condiments", "Other"

Guidelines:
- Convert plural to singular when appropriate (e.g., "apples" → "Apple")
- Normalize units (e.g., "liters" → "l", "grams" → "g")
- If no quantity is specified, use 1
- If no unit is specified, use "pieces"
- Choose the most appropriate category for each ingredient; if unsure, use "Other"
- Ignore non-food items
- For compound or mixed items (e.g., "1 pack of hot dog buns"), do your best to extract the main ingredient and unit
- Always use the same field order: name, quantity, unit, category

Example input: "3 apples, 1kg flour, 2 cans of tuna"
Example output: {
  "ingredients": [
    {"name": "Apple", "quantity": 3, "unit": "pieces", "category": "Fruits"},
    {"name": "Flour", "quantity": 1, "unit": "kg", "category": "Grains"},
    {"name": "Tuna", "quantity": 2, "unit": "cans", "category": "Meat"}
  ]
}

Respond ONLY with the JSON object, no explanations or extra text.`;

    const userMessage = `Parse the following ingredient description into structured JSON format: "${text}"`;

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
          temperature: 0.2,
          max_tokens: 1000,
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to parse ingredients" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const openaiData = await openaiResponse.json();

    // Extract the assistant's response
    const assistantMessage = openaiData.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the JSON response
    let parsedResponse: ParseResponse;
    try {
      parsedResponse = JSON.parse(assistantMessage);
    } catch (_error) {
      console.error("Failed to parse AI response as JSON:", assistantMessage);
      return new Response(
        JSON.stringify({ error: "Invalid response format from AI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate the response structure
    if (
      !parsedResponse.ingredients ||
      !Array.isArray(parsedResponse.ingredients)
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid ingredients format in AI response",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate and sanitize each ingredient
    const validatedIngredients = parsedResponse.ingredients
      .filter(
        (ingredient) =>
          ingredient.name &&
          typeof ingredient.name === "string" &&
          typeof ingredient.quantity === "number" &&
          typeof ingredient.unit === "string" &&
          typeof ingredient.category === "string",
      )
      .map((ingredient) => ({
        name: ingredient.name.trim(),
        quantity: Math.max(0, ingredient.quantity),
        unit: ingredient.unit.trim(),
        category: ingredient.category.trim(),
      }));

    // Return the validated response
    return new Response(
      JSON.stringify({
        ingredients: validatedIngredients,
        usage: openaiData.usage,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Parse ingredients function error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
