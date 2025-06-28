import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import ProgressBar from "../../components/common/ProgressBar";

describe("ProgressBar", () => {
  it("muestra el porcentaje correctamente", () => {
    render(<ProgressBar value={70} />);
    expect(screen.getByText("70%"));
  });
});
