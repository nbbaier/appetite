// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { AddEditItemForm } from "./AddEditItemForm";
import { ShoppingListItems } from "../shopping/ShoppingListItems";

const defaultProps = {
  visible: true,
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
  formData: {
    name: "",
    quantity: "",
    unit: "kg",
    category: "Produce",
    notes: "",
  },
  setFormData: vi.fn(),
  editingItem: null,
  categories: ["Produce", "Bakery"],
  units: ["kg", "pcs"],
};

describe("AddEditItemForm", () => {
  it("renders all input fields", () => {
    render(<AddEditItemForm {...defaultProps} />);
    expect(screen.getByLabelText("Item Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
    expect(screen.getByLabelText("Unit")).toBeInTheDocument();
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Notes (Optional)")).toBeInTheDocument();
  });

  it("calls onSubmit with form data", () => {
    const setFormData = vi.fn();
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <AddEditItemForm
        {...defaultProps}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText("Item Name"), {
      target: { value: "Bread" },
    });
    fireEvent.change(screen.getByLabelText("Quantity"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Unit"), {
      target: { value: "pcs" },
    });
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "Bakery" },
    });
    fireEvent.change(screen.getByLabelText("Notes (Optional)"), {
      target: { value: "Fresh" },
    });
    fireEvent.submit(screen.getByRole("form"));
    expect(onSubmit).toHaveBeenCalled();
  });
});
