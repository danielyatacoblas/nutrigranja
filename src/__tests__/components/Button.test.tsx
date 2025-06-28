import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import Button from "../../components/common/Button";

describe("Button", () => {
  it("muestra el texto correctamente", () => {
    render(<Button>Click aquí</Button>);
    expect(screen.getByText("Click aquí")).toBeInTheDocument();
  });

  it("llama a onClick cuando se hace click", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
