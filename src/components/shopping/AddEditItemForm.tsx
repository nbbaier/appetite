import type React from "react";
import { useId } from "react";
import type { ShoppingListItem } from "../../types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

interface AddEditItemFormProps {
  categories: string[];
  editingItem: ShoppingListItem | null;
  formData: {
    name: string;
    quantity: string;
    unit: string;
    category: string;
    notes: string;
  };
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  setFormData: (data: {
    name: string;
    quantity: string;
    unit: string;
    category: string;
    notes: string;
  }) => void;
  units: string[];
  visible: boolean;
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
  if (!visible) {
    return null;
  }
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">
          {editingItem ? "Edit Item" : "Add New Item"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          aria-label={editingItem ? "Edit shopping item" : "Add shopping item"}
          className="space-y-4"
          onSubmit={onSubmit}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Item Name"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                value={formData.name}
              />
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  label="Quantity"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: e.target.value,
                    })
                  }
                  step="0.1"
                  type="number"
                  value={formData.quantity}
                />
              </div>
              <div className="w-20 sm:w-24">
                <label
                  className="mb-1 block font-medium text-secondary-700 text-sm"
                  htmlFor={unitSelectId}
                >
                  Unit
                </label>
                <select
                  className="h-10 w-full rounded-lg border border-secondary-300 px-2 text-sm focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  id={unitSelectId}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  value={formData.unit}
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
                className="mb-1 block font-medium text-secondary-700 text-sm"
                htmlFor={categorySelectId}
              >
                Category
              </label>
              <select
                className="h-10 w-full rounded-lg border border-secondary-300 px-3 text-sm focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                id={categorySelectId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                  })
                }
                value={formData.category}
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
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Any additional notes..."
            value={formData.notes}
          />
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <Button className="text-sm sm:text-base" type="submit">
              {editingItem ? "Update Item" : "Add Item"}
            </Button>
            <Button
              className="text-sm sm:text-base"
              onClick={onCancel}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
