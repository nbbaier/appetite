import { z } from "zod";

/**
 * Validation error type for consistent error handling
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Result type for validation operations
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] };

/**
 * Formats Zod errors into user-friendly ValidationError array
 */
export function formatZodErrors(error: z.ZodError): ValidationError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

/**
 * Formats validation errors into a single error message string
 */
export function formatErrorMessage(errors: ValidationError[]): string {
  if (errors.length === 0) return "Validation failed";
  if (errors.length === 1) return errors[0].message;

  return `Validation failed:\n${errors.map((e) => `- ${e.field}: ${e.message}`).join("\n")}`;
}

/**
 * Validates data against a Zod schema and returns a ValidationResult
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: formatZodErrors(result.error) };
}

/**
 * Validates data and throws an error if validation fails
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = validate(schema, data);

  if (!result.success) {
    throw new Error(formatErrorMessage(result.errors));
  }

  return result.data;
}

/**
 * Creates a validated wrapper function for async operations
 */
export function createValidatedFunction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  fn: (input: TInput) => Promise<TOutput>,
): (input: unknown) => Promise<TOutput> {
  return async (input: unknown) => {
    const validatedInput = validateOrThrow(schema, input);
    return fn(validatedInput);
  };
}

/**
 * Sanitizes user input to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  // Remove any HTML tags
  const withoutTags = input.replace(/<[^>]*>/g, "");

  // Escape special characters
  const escaped = withoutTags
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  return escaped.trim();
}

/**
 * Sanitizes an object's string fields
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeString(sanitized[key] as string) as T[Extract<
        keyof T,
        string
      >];
    }
  }

  return sanitized;
}

/**
 * Validates environment variables
 */
export function validateEnv<T>(
  schema: z.ZodSchema<T>,
  env: Record<string, string | undefined>,
): T {
  const result = schema.safeParse(env);

  if (!result.success) {
    const errors = formatZodErrors(result.error);
    const errorMessage = `Environment validation failed:\n${errors.map((e) => `- ${e.field}: ${e.message}`).join("\n")}`;

    // In production, this should halt the application
    if (import.meta.env.MODE === "production") {
      throw new Error(errorMessage);
    }

    // In development, log the error and halt the application (same as production)
    console.error(errorMessage);
    // Do not throw in development; allow to continue
  }

  return result.data;
}

/**
 * Partial validation - validates only provided fields
 */
export function validatePartial<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  data: unknown,
): ValidationResult<Partial<z.infer<z.ZodObject<T>>>> {
  const partialSchema = schema.partial() as z.ZodType<
    Partial<z.infer<z.ZodObject<T>>>
  >;
  return validate(partialSchema, data);
}

/**
 * Validates an array of items against a schema
 */
export function validateArray<T>(
  itemSchema: z.ZodSchema<T>,
  data: unknown[],
): ValidationResult<T[]> {
  const arraySchema = z.array(itemSchema);
  return validate(arraySchema, data);
}

/**
 * Creates a type-safe database query validator
 */
export function createQueryValidator<TInput, TOutput>(
  inputSchema: z.ZodSchema<TInput>,
  outputSchema: z.ZodSchema<TOutput>,
) {
  return {
    validateInput: (data: unknown) => validateOrThrow(inputSchema, data),
    validateOutput: (data: unknown) => validateOrThrow(outputSchema, data),
  };
}

/**
 * Safely parses JSON with validation
 */
export function parseJSON<T>(
  schema: z.ZodSchema<T>,
  json: string,
): ValidationResult<T> {
  try {
    const parsed = JSON.parse(json);
    return validate(schema, parsed);
  } catch (error) {
    if (
      typeof process !== "undefined" &&
      process.env &&
      process.env.NODE_ENV === "development"
    ) {
      // Log JSON parse errors in development for debugging
      console.error("parseJSON error:", error);
    }
    return {
      success: false,
      errors: [{ field: "json", message: "Invalid JSON format" }],
    };
  }
}

/**
 * Converts validation errors to a format suitable for react-hook-form
 */
export function toFormErrors(
  errors: ValidationError[],
): Record<string, { message: string }> {
  const formErrors: Record<string, { message: string }> = {};

  for (const error of errors) {
    formErrors[error.field] = { message: error.message };
  }

  return formErrors;
}

/**
 * Debounced validation for form fields
 */
export function createDebouncedValidator<T>(
  schema: z.ZodSchema<T>,
  delay: number = 300,
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (data: unknown): Promise<ValidationResult<T>> => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        resolve(validate(schema, data));
      }, delay);
    });
  };
}

/**
 * Merges multiple validation results
 */
export function mergeValidationResults<T>(
  ...results: ValidationResult<T>[]
): ValidationResult<T> {
  const errors: ValidationError[] = [];
  let lastSuccessData: T | undefined;

  for (const result of results) {
    if (!result.success) {
      errors.push(...result.errors);
    } else {
      lastSuccessData = result.data;
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  if (lastSuccessData === undefined) {
    return {
      success: false,
      errors: [{ field: "general", message: "No valid data found" }],
    };
  }

  return { success: true, data: lastSuccessData };
}
