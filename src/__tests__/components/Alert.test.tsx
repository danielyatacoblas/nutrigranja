import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import Alert from "../../components/common/Alert";

describe("Alert", () => {
  it("muestra el mensaje", () => {
    render(<Alert type="success">Éxito!</Alert>);
    expect(screen.getByText("Éxito!")).toBeInTheDocument();
  });

  it("aplica la clase según el tipo", () => {
    const { rerender } = render(<Alert type="error">Error!</Alert>);
    expect(screen.getByText("Error!")).toHaveClass("alert-error");
    rerender(<Alert type="info">Info</Alert>);
    expect(screen.getByText("Info")).toHaveClass("alert-info");
  });
});
