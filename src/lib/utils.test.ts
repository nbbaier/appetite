import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("merges Tailwind classes with conflict resolution", () => {
    expect(cn("p-2", "p-4")).toBe("p-4"); // tailwind-merge keeps the last
  });

  it("returns an empty string for no input", () => {
    expect(cn()).toBe("");
  });
});
