import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import Modal from "../../components/common/Modal";

describe("Modal", () => {
  it("renderiza el contenido cuando open es true", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        Contenido del modal
      </Modal>
    );
    expect(
      screen.getByText((content) => content.includes("Contenido del modal"))
    ).toBeInTheDocument();
  });

  it("no renderiza el contenido cuando open es false", () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        Contenido del modal
      </Modal>
    );
    expect(
      screen.queryByText((content) => content.includes("Contenido del modal"))
    ).not.toBeInTheDocument();
  });
});
