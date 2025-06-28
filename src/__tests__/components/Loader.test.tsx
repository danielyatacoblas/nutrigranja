import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import Loader from "../../components/common/Loader";

describe("Loader", () => {
  it("renderiza el spinner", () => {
    render(<Loader />);
    expect(screen.getByTestId("loader-spinner")).toBeInTheDocument();
  });

  it("muestra el texto si se pasa como prop", () => {
    render(<Loader text="Cargando..." />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });
});
