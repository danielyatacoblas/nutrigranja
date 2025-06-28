import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import Badge from "../../components/common/Badge";

describe("Badge", () => {
  it("muestra el texto correctamente", () => {
    render(<Badge status="pendiente">Pendiente</Badge>);
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("aplica la clase correcta según el status", () => {
    const { rerender } = render(<Badge status="completado">Completado</Badge>);
    expect(screen.getByText("Completado")).toHaveClass("badge-completado");
    rerender(<Badge status="pendiente">Pendiente</Badge>);
    expect(screen.getByText("Pendiente")).toHaveClass("badge-pendiente");
  });
});
