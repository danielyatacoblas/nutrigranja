import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import Avatar from "../../components/common/Avatar";

describe("Avatar", () => {
  it("muestra las iniciales si no hay imagen", () => {
    render(<Avatar name="Juan Perez" />);
    expect(screen.getByText("JP")).toBeInTheDocument();
  });

  it("muestra la imagen si se pasa prop src", () => {
    render(<Avatar name="Juan Perez" src="/avatar.jpg" />);
    expect(screen.getByAltText("avatar de Juan Perez")).toBeInTheDocument();
  });
});
