import type { FC } from "react";

interface NotificationToggleProps {
  loading?: boolean;
  onChange: (value: boolean) => void;
  value: boolean;
}

export const NotificationToggle: FC<NotificationToggleProps> = ({
  value,
  onChange,
  loading,
}) => (
  <div className="flex items-center space-x-2">
    <label
      className="font-medium text-secondary-700 text-sm"
      htmlFor="notifications-enabled"
    >
      Enable Notifications
    </label>
    <input
      checked={!!value}
      className="h-5 w-5 accent-primary"
      disabled={loading}
      id="notifications-enabled"
      onChange={(e) => onChange(e.target.checked)}
      type="checkbox"
    />
  </div>
);
