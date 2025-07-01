import { describe, expect, it, vi } from "vitest";
import type { Ingredient, Leftover } from "../types";
import { checkExpiringItems } from "./notificationService";

describe("checkExpiringItems", () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const baseIngredient: Ingredient = {
    id: "1",
    user_id: "u1",
    name: "Milk",
    quantity: 1,
    unit: "L",
    category: "Dairy",
    created_at: "",
    updated_at: "",
  };
  const baseLeftover: Leftover = {
    id: "2",
    user_id: "u1",
    name: "Soup",
    quantity: 1,
    unit: "bowl",
    created_at: "",
    updated_at: "",
  };

  it("notifies for expired items", () => {
    const expiredDate = new Date(today);
    expiredDate.setDate(today.getDate() - 2);
    const onNotify = vi.fn();
    checkExpiringItems({
      ingredients: [
        { ...baseIngredient, expiration_date: formatDate(expiredDate) },
      ],
      leftovers: [],
      onNotify,
    });
    expect(onNotify).toHaveBeenCalledWith(
      expect.objectContaining({ notificationType: "expired" }),
    );
  });

  it("notifies for critical items", () => {
    const criticalDate = new Date(today);
    criticalDate.setDate(today.getDate() + 2);
    const onNotify = vi.fn();
    checkExpiringItems({
      ingredients: [
        { ...baseIngredient, expiration_date: formatDate(criticalDate) },
      ],
      leftovers: [],
      onNotify,
      criticalDays: 3,
    });
    expect(onNotify).toHaveBeenCalledWith(
      expect.objectContaining({ notificationType: "critical" }),
    );
  });

  it("notifies for warning items", () => {
    const warningDate = new Date(today);
    warningDate.setDate(today.getDate() + 5);
    const onNotify = vi.fn();
    checkExpiringItems({
      ingredients: [
        { ...baseIngredient, expiration_date: formatDate(warningDate) },
      ],
      leftovers: [],
      onNotify,
      warningDays: 7,
      criticalDays: 3,
    });
    expect(onNotify).toHaveBeenCalledWith(
      expect.objectContaining({ notificationType: "warning" }),
    );
  });

  it("does not notify for items with no expiration_date", () => {
    const onNotify = vi.fn();
    checkExpiringItems({
      ingredients: [{ ...baseIngredient }],
      leftovers: [],
      onNotify,
    });
    expect(onNotify).not.toHaveBeenCalled();
  });

  it("notifies for leftovers as well", () => {
    const criticalDate = new Date(today);
    criticalDate.setDate(today.getDate() + 1);
    const onNotify = vi.fn();
    checkExpiringItems({
      ingredients: [],
      leftovers: [
        { ...baseLeftover, expiration_date: formatDate(criticalDate) },
      ],
      onNotify,
      criticalDays: 2,
    });
    expect(onNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        notificationType: "critical",
        item: expect.objectContaining({ type: "leftover" }),
      }),
    );
  });
});
