import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import Tooltip from "../../components/common/Tooltip";

describe("Tooltip", () => {
  it("muestra el texto al hacer hover", () => {
    render(
      <Tooltip text="Ayuda">
        <button>Botón</button>
      </Tooltip>
    );
    fireEvent.mouseOver(screen.getByText("Botón"));
    expect(screen.getByText("Ayuda")).toBeInTheDocument();
  });
});
