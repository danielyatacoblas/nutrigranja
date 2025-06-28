import React from "react";
export default function Dropdown({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <div>
      <button>{label}</button>
      {options.map((opt) => (
        <div key={opt}>{opt}</div>
      ))}
    </div>
  );
}
