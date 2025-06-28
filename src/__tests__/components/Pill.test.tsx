import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import Pill from "../../components/common/Pill";

describe("Pill", () => {
  it("muestra el texto", () => {
    render(<Pill color="green">Activo</Pill>);
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("aplica la clase según el color", () => {
    const { rerender } = render(<Pill color="red">Inactivo</Pill>);
    expect(screen.getByText("Inactivo")).toHaveClass("pill-red");
    rerender(<Pill color="blue">Azul</Pill>);
    expect(screen.getByText("Azul")).toHaveClass("pill-blue");
  });
});
