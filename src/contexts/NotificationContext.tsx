import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { toast } from "sonner";

export type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationContextValue {
  notify: (
    message: string,
    options?: {
      type?: NotificationType;
      description?: string;
      duration?: number;
      icon?: React.ReactNode;
    },
  ) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const notify = useCallback(
    (
      message: string,
      options?: {
        type?: NotificationType;
        description?: string;
        duration?: number;
        icon?: React.ReactNode;
      },
    ) => {
      toast(message, {
        description: options?.description,
        duration: options?.duration ?? 6000,
        className:
          options?.type === "error"
            ? "bg-red-50 text-red-800 border-red-200"
            : options?.type === "warning"
              ? "bg-orange-50 text-orange-800 border-orange-200"
              : options?.type === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-blue-50 text-blue-800 border-blue-200",
        icon: options?.icon,
      });
    },
    [],
  );

  useEffect(() => {
    (window as unknown as { notify?: typeof notify }).notify = notify;
    return () => {
      delete (window as unknown as { notify?: typeof notify }).notify;
    };
  }, [notify]);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  return ctx;
}
