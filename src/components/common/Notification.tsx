import React from "react";
export default function Notification({
  type,
  children,
}: {
  type: string;
  children: React.ReactNode;
}) {
  return <div className={`notification-${type}`}>{children}</div>;
}
