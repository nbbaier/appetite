import type { Ingredient, Leftover } from "../types";

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
  onNotify: (notification: Notification) => void;
}

export function checkExpiringItems({
  ingredients,
  leftovers,
  criticalDays,
  warningDays,
  notificationEnabled = true,
  onNotify,
}: NotificationServiceOptions & { notificationEnabled?: boolean }) {
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
      if (!item.expiration_date) return;
      const expDate = new Date(item.expiration_date);
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
        onNotify({
          item: {
            id: item.id,
            name: item.name,
            expiration_date: item.expiration_date!,
            type,
            daysLeft,
          },
          notificationType,
          message,
        });
      }
    });
  }

  processItems(ingredients, "ingredient");
  processItems(leftovers, "leftover");
}
