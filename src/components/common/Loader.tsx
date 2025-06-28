import React from "react";
export default function Loader({ text }: { text?: string }) {
  return (
    <div>
      <div data-testid="loader-spinner">Spinner</div>
      {text && <span>{text}</span>}
    </div>
  );
}
