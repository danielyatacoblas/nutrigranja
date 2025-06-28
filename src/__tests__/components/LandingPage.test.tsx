import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import LandingPage from "../../pages/LandingPage";

describe("LandingPage", () => {
  it("renderiza el logo, el título y los botones principales", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    // Logo y título
    expect(screen.getAllByText(/Nutri/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Granja/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText("Gestión Integral para Granjas")
    ).toBeInTheDocument();
    // Botones principales
    expect(
      screen.getByRole("button", { name: /Iniciar Sesión/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Conocer Más/i })
    ).toBeInTheDocument();
  });

  it("muestra las características principales", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Gestión de Proveedores")).toBeInTheDocument();
    expect(screen.getByText("Gestión de Productos")).toBeInTheDocument();
    expect(screen.getByText("Compras Eficientes")).toBeInTheDocument();
    expect(screen.getByText("Reportes Detallados")).toBeInTheDocument();
    expect(screen.getByText("Gestión de Usuarios")).toBeInTheDocument();
    expect(screen.getByText("Historial Completo")).toBeInTheDocument();
  });

  it("muestra los beneficios", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(
      screen.getByText("Ahorra tiempo con procesos automatizados")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Reduce costos optimizando tus compras")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Mejora la calidad con evaluaciones de proveedores")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Toma decisiones basadas en datos reales")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Incrementa la productividad de tu equipo")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Mantén un control total de tu operación")
    ).toBeInTheDocument();
  });

  it("muestra el footer con el copyright", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/2024 NutriGranja/i)).toBeInTheDocument();
  });
});
