import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Ingredient, Leftover } from "../types";
import {
  checkExpiringItems,
  clearNotificationCooldownCache,
} from "./notificationService";

describe("checkExpiringItems", () => {
  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

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

  beforeEach(() => {
    clearNotificationCooldownCache();
    vi.useRealTimers();
  });

  it("notifies for expired items", () => {
    const today = getToday();
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
    const today = getToday();
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
    const today = getToday();
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
    const today = getToday();
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

  it("deduplicates repeated alerts within cooldown", () => {
    const today = getToday();
    const criticalDate = new Date(today);
    criticalDate.setDate(today.getDate() + 1);
    const onNotify = vi.fn();

    checkExpiringItems({
      ingredients: [
        { ...baseIngredient, expiration_date: formatDate(criticalDate) },
      ],
      leftovers: [],
      criticalDays: 2,
      notificationCooldownMs: 60_000,
      onNotify,
    });

    checkExpiringItems({
      ingredients: [
        { ...baseIngredient, expiration_date: formatDate(criticalDate) },
      ],
      leftovers: [],
      criticalDays: 2,
      notificationCooldownMs: 60_000,
      onNotify,
    });

    expect(onNotify).toHaveBeenCalledTimes(1);
  });

  it("notifies again after cooldown expires", () => {
    const now = new Date("2026-03-01T10:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const today = getToday();
    const criticalDate = new Date(today);
    criticalDate.setDate(today.getDate() + 1);
    const onNotify = vi.fn();

    checkExpiringItems({
      ingredients: [
        { ...baseIngredient, expiration_date: formatDate(criticalDate) },
      ],
      leftovers: [],
      criticalDays: 2,
      notificationCooldownMs: 60_000,
      onNotify,
    });

    vi.advanceTimersByTime(60_001);

    checkExpiringItems({
      ingredients: [
        { ...baseIngredient, expiration_date: formatDate(criticalDate) },
      ],
      leftovers: [],
      criticalDays: 2,
      notificationCooldownMs: 60_000,
      onNotify,
    });

    expect(onNotify).toHaveBeenCalledTimes(2);
  });
});
