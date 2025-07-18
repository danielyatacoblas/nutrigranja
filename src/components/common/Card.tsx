import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      data-testid="card"
      className={`bg-white rounded-lg shadow-md p-4 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
