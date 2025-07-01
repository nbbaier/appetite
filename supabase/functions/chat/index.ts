const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  userIngredients?: string[];
  userPreferences?: {
    dietary_restrictions?: string[];
    allergies?: string[];
    cooking_skill_level?: string;
  };
  userId?: string;
}

// Modularized prompt builder
function buildSystemPrompt({
  userIngredients,
  userPreferences,
}: {
  userIngredients?: string[];
  userPreferences?: {
    dietary_restrictions?: string[];
    allergies?: string[];
    cooking_skill_level?: string;
    // Add more fields as needed
  };
}): string {
  let systemContent = `You are a helpful AI cooking assistant for SmartRecipe, a smart recipe management app. You help users with cooking questions, recipe suggestions, and meal planning.

Key capabilities:
- Suggest recipes based on available ingredients
- Provide cooking tips and techniques
- Help with meal planning and preparation
- Answer questions about food storage and safety
- Adapt recipes for dietary restrictions

Guidelines:
- Be friendly, helpful, and encouraging
- Provide practical, actionable advice
- Consider user's skill level and preferences
- Suggest recipes that match available ingredients when possible
- Keep responses concise but informative`;

  // Add user context if available
  if (userIngredients && userIngredients.length > 0) {
    systemContent += `\n\nUser's current pantry ingredients: ${userIngredients.join(", ")}`;
  }
  if (userPreferences) {
    if (
      userPreferences.dietary_restrictions &&
      userPreferences.dietary_restrictions.length > 0
    ) {
      systemContent += `\nDietary restrictions: ${userPreferences.dietary_restrictions.join(", ")}`;
    }
    if (userPreferences.allergies && userPreferences.allergies.length > 0) {
      systemContent += `\nAllergies: ${userPreferences.allergies.join(", ")}`;
    }
    if (userPreferences.cooking_skill_level) {
      systemContent += `\nCooking skill level: ${userPreferences.cooking_skill_level}`;
    }
    // Add more context fields here as needed
  }
  // Future: Add dynamic instructions based on user profile, time of day, etc.
  return systemContent;
}

// Utility for standardized error responses
interface StandardizedError {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}
function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
  requestId?: string,
) {
  const errorObj: StandardizedError = { code, message };
  if (details !== undefined) errorObj.details = details;
  if (requestId) errorObj.requestId = requestId;
  return new Response(JSON.stringify({ error: errorObj }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
// @ts-ignore
Deno.serve(async (req: Request) => {
  const requestId = crypto.randomUUID();
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }
  try {
    if (req.method !== "POST") {
      return errorResponse(
        "method_not_allowed",
        "Method not allowed",
        405,
        undefined,
        requestId,
      );
    }
    // @ts-ignore
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return errorResponse(
        "missing_api_key",
        "OpenAI API key not configured",
        500,
        undefined,
        requestId,
      );
    }
    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    // @ts-ignore
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    let { messages, userIngredients, userPreferences, userId }: ChatRequest =
      await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return errorResponse(
        "invalid_messages_format",
        "'messages' must be a non-empty array",
        400,
        undefined,
        requestId,
      );
    }
    for (const msg of messages) {
      if (
        typeof msg !== "object" ||
        !msg.role ||
        !msg.content ||
        typeof msg.role !== "string" ||
        typeof msg.content !== "string"
      ) {
        return errorResponse(
          "invalid_message_object",
          "Each message must be an object with 'role' and 'content' as strings",
          400,
          undefined,
          requestId,
        );
      }
    }
    if (
      userId !== undefined &&
      (typeof userId !== "string" || userId.trim() === "")
    ) {
      return errorResponse(
        "invalid_user_id",
        "'userId' must be a non-empty string if provided",
        400,
        undefined,
        requestId,
      );
    }
    if (userIngredients !== undefined) {
      if (!Array.isArray(userIngredients)) {
        return errorResponse(
          "invalid_user_ingredients",
          "'userIngredients' must be an array of strings if provided",
          400,
          undefined,
          requestId,
        );
      }
      for (const ing of userIngredients) {
        if (typeof ing !== "string" || ing.trim() === "") {
          return errorResponse(
            "invalid_user_ingredient_item",
            "Each ingredient must be a non-empty string",
            400,
            undefined,
            requestId,
          );
        }
      }
    }
    if (userPreferences !== undefined) {
      if (
        typeof userPreferences !== "object" ||
        Array.isArray(userPreferences)
      ) {
        return errorResponse(
          "invalid_user_preferences",
          "'userPreferences' must be an object if provided",
          400,
          undefined,
          requestId,
        );
      }
      if (
        userPreferences.dietary_restrictions !== undefined &&
        (!Array.isArray(userPreferences.dietary_restrictions) ||
          userPreferences.dietary_restrictions.some(
            (d) => typeof d !== "string",
          ))
      ) {
        return errorResponse(
          "invalid_dietary_restrictions",
          "'dietary_restrictions' must be an array of strings",
          400,
          undefined,
          requestId,
        );
      }
      if (
        userPreferences.allergies !== undefined &&
        (!Array.isArray(userPreferences.allergies) ||
          userPreferences.allergies.some((a) => typeof a !== "string"))
      ) {
        return errorResponse(
          "invalid_allergies",
          "'allergies' must be an array of strings",
          400,
          undefined,
          requestId,
        );
      }
      if (
        userPreferences.cooking_skill_level !== undefined &&
        typeof userPreferences.cooking_skill_level !== "string"
      ) {
        return errorResponse(
          "invalid_cooking_skill_level",
          "'cooking_skill_level' must be a string",
          400,
          undefined,
          requestId,
        );
      }
    }
    // Rate limiting (after validation, before any heavy work)
    const rateLimitKey =
      userId ||
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "anonymous";
    if (supabaseUrl && supabaseServiceRoleKey) {
      const { createClient } = await import(
        // @ts-ignore
        "https://esm.sh/@supabase/supabase-js@2"
      );
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
      const now = new Date();
      const windowStart = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          now.getUTCHours(),
          now.getUTCMinutes(),
          0,
          0,
        ),
      );
      const { data: rateRow, error: rateError } = await supabase
        .from("rate_limits")
        .select("id, count")
        .eq("key", rateLimitKey)
        .eq("window_start", windowStart.toISOString())
        .single();
      if (rateError && rateError.code !== "PGRST116") {
        return errorResponse(
          "rate_limit_error",
          "Failed to check rate limit",
          500,
          rateError,
          requestId,
        );
      }
      if (rateRow) {
        if (rateRow.count >= 10) {
          return errorResponse(
            "rate_limit_exceeded",
            "Too many requests. Please wait and try again.",
            429,
            undefined,
            requestId,
          );
        } else {
          await supabase
            .from("rate_limits")
            .update({ count: rateRow.count + 1 })
            .eq("id", rateRow.id);
        }
      } else {
        await supabase.from("rate_limits").insert({
          key: rateLimitKey,
          window_start: windowStart.toISOString(),
          count: 1,
        });
      }
    }
    if (userId && supabaseUrl && supabaseServiceRoleKey) {
      const { createClient } = await import(
        // @ts-ignore
        "https://esm.sh/@supabase/supabase-js@2"
      );
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("dietary_restrictions, allergies, skill_level")
        .eq("id", userId)
        .single();
      if (profileError) {
        return errorResponse(
          "user_profile_error",
          "Failed to fetch user profile",
          500,
          profileError,
          requestId,
        );
      }
      const { data: pantryItems, error: pantryError } = await supabase
        .from("pantry_items")
        .select("name, quantity, unit, expiration_date")
        .eq("user_id", userId);
      if (pantryError) {
        return errorResponse(
          "user_pantry_error",
          "Failed to fetch pantry items",
          500,
          pantryError,
          requestId,
        );
      }
      if (!userIngredients || userIngredients.length === 0) {
        userIngredients = pantryItems
          ? pantryItems.map((item) => item.name)
          : [];
      }
      if (!userPreferences) {
        userPreferences = {
          dietary_restrictions: profile?.dietary_restrictions || [],
          allergies: profile?.allergies || [],
          cooking_skill_level: profile?.skill_level || undefined,
        };
      }
    }
    const systemContent = buildSystemPrompt({
      userIngredients,
      userPreferences,
    });
    const openaiMessages = [
      { role: "system", content: systemContent },
      ...messages,
    ];
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
          messages: openaiMessages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: false,
        }),
      },
    );
    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => null);
      let code = "openai_api_error";
      let message = "Failed to get AI response";
      if (errorData && errorData.error && typeof errorData.error === "object") {
        if (errorData.error.code === "invalid_api_key") {
          code = "openai_invalid_api_key";
          message = "Invalid OpenAI API key";
        } else if (errorData.error.code === "rate_limit_exceeded") {
          code = "openai_rate_limit";
          message = "OpenAI API rate limit exceeded";
        } else if (errorData.error.code) {
          code = `openai_${errorData.error.code}`;
          message = errorData.error.message || message;
        }
      }
      return errorResponse(
        code,
        message,
        openaiResponse.status,
        errorData,
        requestId,
      );
    }
    const openaiData = await openaiResponse.json();
    const assistantMessage = openaiData.choices?.[0]?.message?.content;
    if (!assistantMessage) {
      return errorResponse(
        "no_ai_response",
        "No response from AI",
        500,
        openaiData,
        requestId,
      );
    }
    return new Response(
      JSON.stringify({
        message: assistantMessage,
        usage: openaiData.usage,
        requestId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
    ) {
      errorMessage = (error as { message: string }).message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    console.error(`[${requestId}] Chat function error:`, error);
    return errorResponse(
      "internal_server_error",
      "Internal server error",
      500,
      errorMessage,
      requestId,
    );
  }
});
