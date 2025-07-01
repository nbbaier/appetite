import React from "react";
import type { ShoppingListItem } from "../../types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { useId } from "react";

interface AddEditItemFormProps {
  visible: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  formData: {
    name: string;
    quantity: string;
    unit: string;
    category: string;
    notes: string;
  };
  setFormData: (data: {
    name: string;
    quantity: string;
    unit: string;
    category: string;
    notes: string;
  }) => void;
  editingItem: ShoppingListItem | null;
  categories: string[];
  units: string[];
}

export const AddEditItemForm: React.FC<AddEditItemFormProps> = ({
  visible,
  onSubmit,
  onCancel,
  formData,
  setFormData,
  editingItem,
  categories,
  units,
}) => {
  const unitSelectId = useId();
  const categorySelectId = useId();
  if (!visible) return null;
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">
          {editingItem ? "Edit Item" : "Add New Item"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" role="form">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Item Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  label="Quantity"
                  type="number"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: e.target.value,
                    })
                  }
                />
              </div>
              <div className="w-20 sm:w-24">
                <label
                  htmlFor={unitSelectId}
                  className="block mb-1 text-sm font-medium text-secondary-700"
                >
                  Unit
                </label>
                <select
                  id={unitSelectId}
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  className="px-2 w-full h-10 text-sm rounded-lg border border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor={categorySelectId}
                className="block mb-1 text-sm font-medium text-secondary-700"
              >
                Category
              </label>
              <select
                id={categorySelectId}
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                  })
                }
                className="px-3 w-full h-10 text-sm rounded-lg border border-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Any additional notes..."
          />
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button type="submit" className="text-sm sm:text-base">
              {editingItem ? "Update Item" : "Add Item"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="text-sm sm:text-base"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
