import React from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
}

export default function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-bar">
      <div
        className="progress-bar-fill bg-nutri-green"
        style={{ width: `${value}%` }}
      >
        {value}%
      </div>
    </div>
  );
}
