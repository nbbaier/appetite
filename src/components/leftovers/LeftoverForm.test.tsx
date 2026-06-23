import type { User } from "@supabase/supabase-js";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import * as AuthContext from "../../contexts/AuthContext";
import { AuthProvider } from "../../contexts/AuthContext";
import { LeftoverForm } from "./LeftoverForm";

const mockUser: User = {
  id: "test-user",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: "2024-01-01",
};

// Mock useAuth to always return a user
vi.spyOn(AuthContext, "useAuth").mockReturnValue({
  user: mockUser,
} as ReturnType<typeof AuthContext.useAuth>);

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider isSupabaseConnectedOverride={true}>{children}</AuthProvider>
  );
}

describe("LeftoverForm", () => {
  it("renders all input fields", () => {
    render(<LeftoverForm onCancel={vi.fn()} onSubmit={vi.fn()} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByLabelText("Leftover Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
    expect(screen.getByLabelText("Unit")).toBeInTheDocument();
  });

  it("calls onSubmit with form data", () => {
    const onSubmit = vi.fn();
    render(<LeftoverForm onCancel={vi.fn()} onSubmit={onSubmit} />, {
      wrapper: Wrapper,
    });
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
