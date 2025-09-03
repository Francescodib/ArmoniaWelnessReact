import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import type { Appointment } from '../types/index';

interface StatusBadgeProps {
  status: Appointment['status'];
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  showIcon = true, 
  size = 'md' 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Confermata',
          icon: CheckCircle,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600'
        };
      case 'pending':
        return {
          label: 'In Attesa',
          icon: Clock,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600'
        };
      default:
        return {
          label: 'Sconosciuto',
          icon: Clock,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full border font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses[size]}
      `}
    >
      {showIcon && (
        <Icon className={`${iconSizes[size]} ${config.iconColor}`} />
      )}
      {config.label}
    </div>
  );
};

export default StatusBadge;
