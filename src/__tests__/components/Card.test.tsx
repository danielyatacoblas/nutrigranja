import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import Card from "../../components/common/Card";

describe("Card", () => {
  it("renderiza el contenido correctamente", () => {
    render(<Card>Contenido de prueba</Card>);
    expect(screen.getByTestId("card")).toHaveTextContent("Contenido de prueba");
  });
});
