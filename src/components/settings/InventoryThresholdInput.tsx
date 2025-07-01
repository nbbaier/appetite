import { FC } from "react";
import { Input } from "../ui/input";

interface InventoryThresholdInputProps {
  value: number;
  onChange: (value: number) => void;
  loading?: boolean;
}

export const InventoryThresholdInput: FC<InventoryThresholdInputProps> = ({
  value,
  onChange,
  loading,
}) => (
  <div className="flex items-center space-x-2">
    <label className="text-sm font-medium text-secondary-700">
      Low Inventory Alert Threshold
    </label>
    <Input
      type="number"
      min={1}
      max={20}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value) || 1)}
      disabled={loading}
      className="w-20 text-sm rounded-lg border border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
    />
  </div>
);
