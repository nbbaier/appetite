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
function formatZodErrors(error: z.ZodError): ValidationError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

/**
 * Formats validation errors into a single error message string
 */
function formatErrorMessage(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return "Validation failed";
  }
  if (errors.length === 1) {
    return errors[0].message;
  }

  return `Validation failed:\n${errors.map((e) => `- ${e.field}: ${e.message}`).join("\n")}`;
}

/**
 * Validates data against a Zod schema and returns a ValidationResult
 */
function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
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
 * Validates environment variables
 */
export function validateEnv<T>(
  schema: z.ZodSchema<T>,
  env: Record<string, string | undefined>
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
 * Validates an array of items and throws an error if validation fails.
 * This is more efficient than mapping over individual items as it validates
 * the entire array at once using z.array(schema).
 */
export function validateArrayOrThrow<T>(
  itemSchema: z.ZodSchema<T>,
  data: unknown
): T[] {
  const arraySchema = z.array(itemSchema);
  return validateOrThrow(arraySchema, data);
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
    if (result.success) {
      lastSuccessData = result.data;
    } else {
      errors.push(...result.errors);
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
