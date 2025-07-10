
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading = false, className = '', ...props }) => {
  const baseStyles = 'px-6 py-2 font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200 ease-in-out transform disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-primary text-on-primary hover:bg-opacity-90 focus:ring-primary',
    secondary: 'bg-secondary text-on-secondary hover:bg-opacity-90 focus:ring-secondary',
    ghost: 'bg-transparent border border-surface-2 hover:bg-surface-2 text-on-surface focus:ring-primary',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2">Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
