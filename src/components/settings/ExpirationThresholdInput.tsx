import type { FC } from "react";
import { Input } from "../ui/input";

interface ExpirationThresholdInputProps {
  loading?: boolean;
  onChange: (value: number) => void;
  value: number;
}

export const ExpirationThresholdInput: FC<ExpirationThresholdInputProps> = ({
  value,
  onChange,
  loading,
}) => (
  <div className="flex items-center space-x-2">
    <label
      className="font-medium text-secondary-700 text-sm"
      htmlFor="expiration-threshold-days"
    >
      Expiration Alert Threshold (days)
    </label>
    <Input
      className="w-20 rounded-lg border border-secondary-300 text-sm focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
      disabled={loading}
      id="expiration-threshold-days"
      max={30}
      min={1}
      onChange={(e) => onChange(Number.parseInt(e.target.value, 10) || 3)}
      type="number"
      value={value}
    />
  </div>
);
