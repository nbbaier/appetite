import { FC } from "react";

interface NotificationToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  loading?: boolean;
}

export const NotificationToggle: FC<NotificationToggleProps> = ({
  value,
  onChange,
  loading,
}) => (
  <div className="flex items-center space-x-2">
    <label className="text-sm font-medium text-secondary-700">
      Enable Notifications
    </label>
    <input
      type="checkbox"
      checked={!!value}
      onChange={(e) => onChange(e.target.checked)}
      disabled={loading}
      className="w-5 h-5 accent-primary"
    />
  </div>
);
