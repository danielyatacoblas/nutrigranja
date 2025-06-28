import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import Table from "../../components/common/Table";

describe("Table", () => {
  it("muestra los headers y filas", () => {
    render(
      <Table
        headers={["Nombre", "Edad"]}
        rows={[
          ["Juan", 30],
          ["Ana", 25],
        ]}
      />
    );
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Edad")).toBeInTheDocument();
    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
  });
});
