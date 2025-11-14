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
 * Sanitizes user input to prevent XSS attacks by escaping HTML special characters.
 * Does not strip existing HTML tags to avoid double-escaping already-escaped entities.
 */
export function sanitizeString(input: string): string {
  // Escape special characters only
  const escaped = input
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
    // Always halt the application on validation failure
    throw new Error(errorMessage);
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
 * Validates an array of items and throws an error if validation fails.
 * This is more efficient than mapping over individual items as it validates
 * the entire array at once using z.array(schema).
 */
export function validateArrayOrThrow<T>(
  itemSchema: z.ZodSchema<T>,
  data: unknown,
): T[] {
  const arraySchema = z.array(itemSchema);
  return validateOrThrow(arraySchema, data);
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
      import.meta.env.MODE === "development"
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
 * Returns a validator function and a cleanup function to prevent memory leaks
 * 
 * @example
 * ```typescript
 * // Create validator with cleanup
 * const { validator, cleanup } = createDebouncedValidator(mySchema, 300);
 * 
 * // Use the validator
 * const result = await validator(data);
 * 
 * // Clean up when component unmounts or validator is no longer needed
 * cleanup();
 * ```
 */
export function createDebouncedValidator<T>(
  schema: z.ZodSchema<T>,
  delay: number = 300,
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const validator = (data: unknown): Promise<ValidationResult<T>> => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        resolve(validate(schema, data));
        timeoutId = null;
      }, delay);
    });
  };

  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return { validator, cleanup };
}

/**
 * Collects validation errors from multiple validation results.
 * 
 * This function aggregates all errors from failed validations. If ANY validation
 * fails, the entire result is considered a failure with all collected errors.
 * If all validations succeed, returns success with the data from the last result.
 * 
 * **Important behavior notes:**
 * - Returns failure if ANY input result failed (fail-fast semantics)
 * - Accumulates ALL errors from failed results
 * - Only returns success if ALL results succeeded
 * - When all succeed, returns the data from the LAST successful result
 * 
 * **Use cases:**
 * - Sequential validation of the same data through multiple validators
 * - Collecting all validation errors before presenting to user
 * - NOT suitable for merging validations of different data objects
 * 
 * @example
 * ```ts
 * // Validate user input through multiple validators
 * const result1 = validate(emailSchema, input);
 * const result2 = validate(passwordSchema, input);
 * const combined = collectValidationErrors(result1, result2);
 * // If either fails, combined contains all errors from both
 * ```
 * 
 * @param results - Variable number of validation results to merge
 * @returns A single validation result with aggregated errors or final success data
 */
export function collectValidationErrors<T>(
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

/**
 * @deprecated Use collectValidationErrors instead. This function name was misleading
 * about its actual behavior.
 */
export function mergeValidationResults<T>(
  ...results: ValidationResult<T>[]
): ValidationResult<T> {
  return collectValidationErrors(...results);
}
