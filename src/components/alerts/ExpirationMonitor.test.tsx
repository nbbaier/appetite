import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";
import type { Ingredient } from "../../types";
import { ExpirationMonitor } from "./ExpirationMonitor";

vi.mock("../../contexts/SettingsContext", () => ({
  useSettings: () => ({
    settings: { expiration_threshold_days: 3 },
  }),
}));

const dateFromToday = (days: number) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

const makeIngredient = (
  id: string,
  name: string,
  expirationDate: string,
): Ingredient => ({
  id,
  user_id: "user1",
  name,
  quantity: 1,
  unit: "pcs",
  category: "Dairy",
  expiration_date: expirationDate,
  notes: "",
  low_stock_threshold: 1,
  created_at: "2025-06-01T00:00:00Z",
  updated_at: "2025-06-01T00:00:00Z",
});

describe("ExpirationMonitor", () => {
  it("renders ingredients that are expiring soon", () => {
    render(
      <ExpirationMonitor
        ingredients={[
          makeIngredient("1", "Milk", dateFromToday(1)),
          makeIngredient("2", "Eggs", dateFromToday(5)),
        ]}
      />,
    );

    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();
  });

  it("uses settings to group critical and warning items", () => {
    render(
      <ExpirationMonitor
        ingredients={[
          makeIngredient("1", "Yogurt", dateFromToday(3)),
          makeIngredient("2", "Cheese", dateFromToday(7)),
        ]}
      />,
    );

    expect(screen.getByText("Critical (1)")).toBeInTheDocument();
    expect(screen.getByText("Warning (1)")).toBeInTheDocument();
  });

  it("shows an all-clear message when no items expire soon", () => {
    render(
      <ExpirationMonitor
        ingredients={[makeIngredient("1", "Butter", dateFromToday(30))]}
      />,
    );

    expect(screen.getByText(/no items expiring soon/i)).toBeInTheDocument();
  });
});
