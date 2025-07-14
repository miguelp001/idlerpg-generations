import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'shadow' | 'blood' | 'bone' | 'cursed' | 'spectral' | 'void';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'shadow', 
  size = 'md',
  isLoading = false, 
  icon,
  iconPosition = 'left',
  className = '', 
  ...props 
}) => {
  const baseStyles = `
    relative inline-flex items-center justify-center font-bold 
    focus:outline-none transition-all duration-300 ease-out transform 
    disabled:opacity-50 disabled:cursor-not-allowed active:scale-95
    border-2 shadow-lg
    before:absolute before:inset-0 before:rounded-md before:transition-opacity before:duration-300
  `;

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm gap-1.5 rounded-md',
    md: 'px-6 py-3 text-base gap-2 rounded-lg',
    lg: 'px-8 py-4 text-lg gap-2 rounded-lg',
    xl: 'px-10 py-5 text-xl gap-3 rounded-xl'
  };

  const variantStyles = {
    shadow: `
      bg-gradient-to-b from-gray-700 to-gray-900 
      border-red-800 
      text-gray-100 
      shadow-red-900/50
      hover:from-gray-600 hover:to-gray-800 
      hover:border-red-700
      hover:shadow-xl hover:shadow-red-900/60
      hover:scale-105
      before:bg-gradient-to-b before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100
      active:from-gray-800 active:to-black
    `,
    blood: `
      bg-gradient-to-b from-red-700 to-red-900 
      border-red-950 
      text-red-100 
      shadow-red-950/60
      hover:from-red-600 hover:to-red-800 
      hover:border-red-900
      hover:shadow-xl hover:shadow-red-950/70
      hover:scale-105
      before:bg-gradient-to-b before:from-white/15 before:to-transparent before:opacity-0 hover:before:opacity-100
      active:from-red-800 active:to-red-950
    `,
    bone: `
      bg-gradient-to-b from-gray-600 to-gray-800 
      border-gray-900 
      text-gray-200 
      shadow-black/60
      hover:from-gray-500 hover:to-gray-700 
      hover:border-gray-800
      hover:shadow-xl hover:shadow-black/70
      hover:scale-105
      before:bg-gradient-to-b before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100
      active:from-gray-700 active:to-gray-900
    `,
    cursed: `
      bg-gradient-to-b from-green-800 to-green-950 
      border-green-950 
      text-green-100 
      shadow-green-950/60
      hover:from-green-700 hover:to-green-900 
      hover:border-green-900
      hover:shadow-xl hover:shadow-green-950/70
      hover:scale-105
      before:bg-gradient-to-b before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100
      active:from-green-900 active:to-black
    `,
    spectral: `
      bg-gradient-to-b from-purple-800 to-purple-950 
      border-purple-950 
      text-purple-100 
      shadow-purple-950/60
      hover:from-purple-700 hover:to-purple-900 
      hover:border-purple-900
      hover:shadow-xl hover:shadow-purple-950/70
      hover:scale-105
      before:bg-gradient-to-b before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100
      active:from-purple-900 active:to-black
    `,
    void: `
      bg-transparent 
      border-gray-700/50 
      text-gray-300 
      shadow-none
      hover:bg-gray-900/30 
      hover:border-gray-600
      hover:text-gray-100
      hover:shadow-lg hover:shadow-black/40
      hover:scale-105
      before:bg-gradient-to-b before:from-gray-600/10 before:to-transparent before:opacity-0 hover:before:opacity-100
    `
  };

  const LoadingSpinner = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <LoadingSpinner />
          <span>Loading...</span>
        </>
      );
    }

    if (icon && iconPosition === 'left') {
      return (
        <>
          {icon}
          {children}
        </>
      );
    }

    if (icon && iconPosition === 'right') {
      return (
        <>
          {children}
          {icon}
        </>
      );
    }

    return children;
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <span className="relative z-10">
        {renderContent()}
      </span>
    </button>
  );
};

export default Button;
