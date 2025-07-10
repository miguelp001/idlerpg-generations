
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const cardClasses = `bg-surface-1 rounded-lg shadow-lg p-6 transition-all duration-300 ${onClick ? 'cursor-pointer hover:bg-surface-2 hover:shadow-xl transform hover:-translate-y-1' : ''} ${className}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
