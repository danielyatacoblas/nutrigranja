import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import Stepper from "../../components/common/Stepper";

describe("Stepper", () => {
  it("muestra los pasos y el activo", () => {
    render(<Stepper steps={["Uno", "Dos", "Tres"]} activeStep={1} />);
    expect(screen.getByText("Uno")).toBeInTheDocument();
    expect(screen.getByText("Dos")).toHaveClass("step-active");
    expect(screen.getByText("Tres")).toBeInTheDocument();
  });
});
