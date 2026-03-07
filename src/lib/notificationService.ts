import type { Ingredient, Leftover } from "../types";

const DEFAULT_NOTIFICATION_COOLDOWN_MS = 1000 * 60 * 60 * 6;
const notificationCooldownCache = new Map<string, number>();

export type NotificationType = "expired" | "critical" | "warning";

export interface ExpiringItem {
  id: string;
  name: string;
  expiration_date: string;
  type: "ingredient" | "leftover";
  daysLeft: number;
}

export interface Notification {
  item: ExpiringItem;
  notificationType: NotificationType;
  message: string;
}

export interface NotificationServiceOptions {
  ingredients: Ingredient[];
  leftovers: Leftover[];
  criticalDays?: number;
  warningDays?: number;
  notificationEnabled?: boolean;
  notificationCooldownMs?: number;
  onNotify: (notification: Notification) => void;
}

function getNotificationCacheKey(notification: Notification): string {
  return [
    notification.item.type,
    notification.item.id,
    notification.notificationType,
    notification.item.expiration_date,
  ].join(":");
}

function shouldEmitNotification(
  notification: Notification,
  notificationCooldownMs: number,
): boolean {
  if (notificationCooldownMs <= 0) {
    return true;
  }

  const key = getNotificationCacheKey(notification);
  const now = Date.now();
  const lastNotificationTime = notificationCooldownCache.get(key);

  if (
    typeof lastNotificationTime === "number" &&
    now - lastNotificationTime < notificationCooldownMs
  ) {
    return false;
  }

  notificationCooldownCache.set(key, now);
  return true;
}

export function clearNotificationCooldownCache() {
  notificationCooldownCache.clear();
}

export function checkExpiringItems({
  ingredients,
  leftovers,
  criticalDays,
  warningDays,
  notificationEnabled = true,
  notificationCooldownMs = DEFAULT_NOTIFICATION_COOLDOWN_MS,
  onNotify,
}: NotificationServiceOptions) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const crit = typeof criticalDays === "number" ? criticalDays : 3;
  const warn = typeof warningDays === "number" ? warningDays : 7;

  // Helper to process a list
  function processItems(
    items: (Ingredient | Leftover)[],
    type: "ingredient" | "leftover",
  ) {
    items.forEach((item) => {
      const expirationDate = item.expiration_date;
      if (!expirationDate) return;

      const expDate = new Date(expirationDate);
      expDate.setHours(0, 0, 0, 0);
      const diffTime = expDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      let notificationType: NotificationType | null = null;
      let message = "";
      if (daysLeft < 0) {
        notificationType = "expired";
        message = `${item.name} expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? "s" : ""} ago.`;
      } else if (daysLeft <= crit) {
        notificationType = "critical";
        message = `${item.name} expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""} (critical).`;
      } else if (daysLeft <= warn) {
        notificationType = "warning";
        message = `${item.name} expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""} (warning).`;
      }
      if (notificationType && notificationEnabled) {
        const notification: Notification = {
          item: {
            id: item.id,
            name: item.name,
            expiration_date: expirationDate,
            type,
            daysLeft,
          },
          notificationType,
          message,
        };

        if (shouldEmitNotification(notification, notificationCooldownMs)) {
          onNotify(notification);
        }
      }
    });
  }

  processItems(ingredients, "ingredient");
  processItems(leftovers, "leftover");
}
