import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import Notification from "../../components/common/Notification";

describe("Notification", () => {
  it("muestra el mensaje", () => {
    render(<Notification type="success">Guardado</Notification>);
    expect(screen.getByText("Guardado")).toBeInTheDocument();
  });

  it("aplica la clase según el tipo", () => {
    const { rerender } = render(
      <Notification type="error">Error</Notification>
    );
    expect(screen.getByText("Error")).toHaveClass("notification-error");
    rerender(<Notification type="info">Info</Notification>);
    expect(screen.getByText("Info")).toHaveClass("notification-info");
  });
});
