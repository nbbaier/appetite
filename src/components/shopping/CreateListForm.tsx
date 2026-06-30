import type React from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

interface CreateListFormProps {
  formData: { name: string; description: string };
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  setFormData: (data: { name: string; description: string }) => void;
  visible: boolean;
}

export const CreateListForm: React.FC<CreateListFormProps> = ({
  visible,
  onSubmit,
  onCancel,
  formData,
  setFormData,
}) => {
  if (!visible) {
    return null;
  }
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">
          Create New Shopping List
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="List Name"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Weekly Groceries"
            required
            value={formData.name}
          />
          <Input
            label="Description (Optional)"
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="e.g., Ingredients for this week's meal prep"
            value={formData.description}
          />
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <Button className="text-sm sm:text-base" type="submit">
              Create List
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
