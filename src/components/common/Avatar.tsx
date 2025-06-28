import React from "react";
export default function Avatar({ name, src }: { name: string; src?: string }) {
  if (src) return <img src={src} alt={`avatar de ${name}`} />;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return <span>{initials}</span>;
}
