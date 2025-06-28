
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
      case 'outline':
        return 'bg-transparent border border-nutri-green text-nutri-green hover:bg-nutri-green/10';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      default:
        return 'bg-nutri-green text-white hover:bg-nutri-lightgreen';
    }
  };
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm px-2 py-1';
      case 'lg':
        return 'text-lg px-5 py-3';
      default:
        return 'px-4 py-2';
    }
  };
  
  return (
    <button
      className={`rounded-md font-medium transition-colors ${getVariantClasses()} ${getSizeClasses()} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
