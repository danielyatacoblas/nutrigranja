import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import Sidebar from "../../components/layout/Sidebar";
import { MemoryRouter } from "react-router-dom";
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "1", email: "test@example.com" },
    userProfile: { rol: "admin" },
    signOut: vi.fn(),
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));
describe("Sidebar", () => {
  it("renderiza los labels de menú", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Ranking")).toBeInTheDocument();
    expect(screen.getByText("Compra")).toBeInTheDocument();
    expect(screen.getByText("Proveedores")).toBeInTheDocument();
    expect(screen.getByText("Usuarios")).toBeInTheDocument();
  });
});
