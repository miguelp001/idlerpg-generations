import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'shadow' | 'blood' | 'bone' | 'obsidian' | 'cursed';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  variant = 'shadow',
  padding = 'md'
}) => {
  const baseClasses = 'relative transition-all duration-300 ease-out transform';
  
  const variantClasses = {
    shadow: `
      bg-gradient-to-br from-gray-900 to-black 
      border-2 border-red-900/60 
      shadow-2xl shadow-red-900/40
      text-gray-100
      before:absolute before:inset-0 before:bg-gradient-to-br before:from-red-950/20 before:to-transparent before:rounded-lg before:pointer-events-none
      rounded-lg
    `,
    blood: `
      bg-gradient-to-br from-red-950 to-red-900 
      border-2 border-red-700/80 
      shadow-xl shadow-red-900/60
      text-red-100
      before:absolute before:inset-0 before:bg-gradient-to-br before:from-red-800/30 before:to-transparent before:rounded-md before:pointer-events-none
      after:absolute after:inset-0 after:rounded-md after:shadow-inner after:shadow-red-600/20 after:pointer-events-none
      rounded-md
    `,
    bone: `
      bg-gradient-to-br from-gray-800 to-gray-900 
      border-2 border-gray-600/80 
      shadow-lg shadow-black/60
      text-gray-200
      before:absolute before:inset-0 before:bg-[url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)" opacity="0.1"/%3E%3C/svg%3E')] before:rounded-lg before:pointer-events-none
      rounded-lg
    `,
    obsidian: `
      bg-gradient-to-br from-slate-900 to-black 
      border-2 border-purple-900/70 
      shadow-2xl shadow-purple-900/50
      text-slate-100
      before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-950/30 before:via-transparent before:to-indigo-950/20 before:rounded-md before:pointer-events-none
      after:absolute after:inset-0 after:rounded-md after:shadow-inner after:shadow-purple-500/10 after:pointer-events-none
      rounded-md
    `,
    cursed: `
      bg-gradient-to-br from-green-950 to-black 
      border-2 border-green-800/60 
      shadow-2xl shadow-green-900/40
      text-green-100
      before:absolute before:inset-0 before:bg-gradient-to-br before:from-green-900/20 before:via-transparent before:to-emerald-950/30 before:rounded-lg before:pointer-events-none
      after:absolute after:inset-0 after:rounded-lg after:shadow-inner after:shadow-green-400/10 after:pointer-events-none
      rounded-lg
    `
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const interactiveClasses = onClick 
    ? 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] hover:brightness-110' 
    : '';

  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClasses} ${className}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card;
