import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import Dropdown from "../../components/common/Dropdown";

describe("Dropdown", () => {
  it("muestra el label y las opciones", () => {
    render(<Dropdown label="Selecciona" options={["Uno", "Dos"]} />);
    expect(screen.getByText("Selecciona")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Selecciona"));
    expect(screen.getByText("Uno")).toBeInTheDocument();
    expect(screen.getByText("Dos")).toBeInTheDocument();
  });
});
