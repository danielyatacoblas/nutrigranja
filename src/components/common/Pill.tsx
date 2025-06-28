import React from "react";
export default function Pill({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return <span className={`pill-${color}`}>{children}</span>;
}
