import React from "react";
export default function Tooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <span onMouseOver={() => setShow(true)} onMouseOut={() => setShow(false)}>
      {children}
      {show && <span>{text}</span>}
    </span>
  );
}
