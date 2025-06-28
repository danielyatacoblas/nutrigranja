import React from "react";
export default function Alert({
  type,
  children,
}: {
  type: string;
  children: React.ReactNode;
}) {
  return <div className={`alert-${type}`}>{children}</div>;
}
