import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

interface CreateListFormProps {
  visible: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  formData: { name: string; description: string };
  setFormData: (data: { name: string; description: string }) => void;
}

export const CreateListForm: React.FC<CreateListFormProps> = ({
  visible,
  onSubmit,
  onCancel,
  formData,
  setFormData,
}) => {
  if (!visible) return null;
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">
          Create New Shopping List
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="List Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g., Weekly Groceries"
          />
          <Input
            label="Description (Optional)"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="e.g., Ingredients for this week's meal prep"
          />
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button type="submit" className="text-sm sm:text-base">
              Create List
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
