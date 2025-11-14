import { describe, expect, it } from "vitest";
import {
  collectValidationErrors,
  mergeValidationResults,
  type ValidationResult,
} from "./utils";

describe("collectValidationErrors", () => {
  it("returns success when all results succeed (uses last data)", () => {
    const result1: ValidationResult<string> = {
      success: true,
      data: "first",
    };
    const result2: ValidationResult<string> = {
      success: true,
      data: "second",
    };
    const result3: ValidationResult<string> = {
      success: true,
      data: "third",
    };

    const merged = collectValidationErrors(result1, result2, result3);

    expect(merged.success).toBe(true);
    if (merged.success) {
      expect(merged.data).toBe("third"); // Last successful data
    }
  });

  it("returns failure with all errors when any result fails", () => {
    const result1: ValidationResult<string> = {
      success: false,
      errors: [{ field: "field1", message: "Error 1" }],
    };
    const result2: ValidationResult<string> = {
      success: true,
      data: "valid",
    };
    const result3: ValidationResult<string> = {
      success: false,
      errors: [{ field: "field2", message: "Error 2" }],
    };

    const merged = collectValidationErrors(result1, result2, result3);

    expect(merged.success).toBe(false);
    if (!merged.success) {
      expect(merged.errors).toHaveLength(2);
      expect(merged.errors[0]).toEqual({ field: "field1", message: "Error 1" });
      expect(merged.errors[1]).toEqual({ field: "field2", message: "Error 2" });
    }
  });

  it("returns failure when all results fail", () => {
    const result1: ValidationResult<string> = {
      success: false,
      errors: [{ field: "field1", message: "Error 1" }],
    };
    const result2: ValidationResult<string> = {
      success: false,
      errors: [{ field: "field2", message: "Error 2" }],
    };

    const merged = collectValidationErrors(result1, result2);

    expect(merged.success).toBe(false);
    if (!merged.success) {
      expect(merged.errors).toHaveLength(2);
    }
  });

  it("handles empty results array", () => {
    const merged = collectValidationErrors<string>();

    expect(merged.success).toBe(false);
    if (!merged.success) {
      expect(merged.errors).toHaveLength(1);
      expect(merged.errors[0].message).toBe("No valid data found");
    }
  });

  it("handles single successful result", () => {
    const result: ValidationResult<number> = {
      success: true,
      data: 42,
    };

    const merged = collectValidationErrors(result);

    expect(merged.success).toBe(true);
    if (merged.success) {
      expect(merged.data).toBe(42);
    }
  });

  it("handles single failed result", () => {
    const result: ValidationResult<number> = {
      success: false,
      errors: [{ field: "num", message: "Invalid number" }],
    };

    const merged = collectValidationErrors(result);

    expect(merged.success).toBe(false);
    if (!merged.success) {
      expect(merged.errors).toHaveLength(1);
      expect(merged.errors[0].message).toBe("Invalid number");
    }
  });

  it("accumulates errors from multiple failures", () => {
    const result1: ValidationResult<string> = {
      success: false,
      errors: [
        { field: "email", message: "Invalid email" },
        { field: "email", message: "Email required" },
      ],
    };
    const result2: ValidationResult<string> = {
      success: false,
      errors: [{ field: "password", message: "Password too short" }],
    };

    const merged = collectValidationErrors(result1, result2);

    expect(merged.success).toBe(false);
    if (!merged.success) {
      expect(merged.errors).toHaveLength(3);
    }
  });
});

describe("mergeValidationResults (deprecated)", () => {
  it("delegates to collectValidationErrors", () => {
    const result1: ValidationResult<string> = {
      success: true,
      data: "test",
    };

    const merged = mergeValidationResults(result1);

    expect(merged.success).toBe(true);
    if (merged.success) {
      expect(merged.data).toBe("test");
    }
  });
});
