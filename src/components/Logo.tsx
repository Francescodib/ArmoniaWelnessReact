import React from 'react';
import { Flower } from 'lucide-react';

interface LogoProps {
  variant?: 'color' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'color', 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const iconColor = variant === 'white' ? 'text-white' : 'text-indigo-600';
  const textColor = variant === 'white' ? 'text-white' : 'text-gray-900';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Flower className={`${sizeClasses[size]} ${iconColor}`} />
      <div className="flex flex-col">
        <span className={`font-bold text-lg leading-tight ${textColor}`}>
          Armonia
        </span>
        <span className={`font-light text-sm leading-tight ${textColor}`}>
          Wellness
        </span>
      </div>
    </div>
  );
};

export default Logo;
