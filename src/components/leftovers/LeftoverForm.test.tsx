// biome-ignore-all assist/source/organizeImports: needed for testing
// @ts-nocheck
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { LeftoverForm } from "./LeftoverForm";
import { AuthProvider } from "../../contexts/AuthContext";
import * as AuthContext from "../../contexts/AuthContext";

// Mock useAuth to always return a user
vi.spyOn(AuthContext, "useAuth").mockReturnValue({ user: { id: "test-user" } });

function Wrapper({ children }) {
  return (
    <AuthProvider isSupabaseConnectedOverride={true}>{children}</AuthProvider>
  );
}

describe("LeftoverForm", () => {
  it("renders all input fields", () => {
    render(<LeftoverForm onSubmit={vi.fn()} />, { wrapper: Wrapper });
    expect(screen.getByLabelText("Leftover Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
    expect(screen.getByLabelText("Unit")).toBeInTheDocument();
  });

  it("calls onSubmit with form data", () => {
    const onSubmit = vi.fn();
    render(<LeftoverForm onSubmit={onSubmit} />, { wrapper: Wrapper });
    fireEvent.change(screen.getByLabelText("Leftover Name"), {
      target: { value: "Soup" },
    });
    fireEvent.change(screen.getByLabelText("Quantity"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Unit"), {
      target: { value: "cups" },
    });
    fireEvent.submit(screen.getByRole("form"));
    expect(onSubmit).toHaveBeenCalled();
  });
});
