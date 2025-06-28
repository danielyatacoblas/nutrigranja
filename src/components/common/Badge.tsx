import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  status?: "pendiente" | "completado" | "cancelado" | "en-proceso";
}

export default function Badge({
  status,
  children,
}: {
  status: string;
  children: React.ReactNode;
}) {
  const className =
    status === "completado"
      ? "badge-completado"
      : status === "pendiente"
      ? "badge-pendiente"
      : "";
  return <span className={className}>{children}</span>;
}
