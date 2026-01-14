

import React from 'react';
import { OrderStatus } from '../types';

export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ children, onClick, variant = 'primary', className = '', disabled, fullWidth, size = 'md' }) => {
  const baseStyles = "rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const variants = {
    primary: "bg-gradient-to-r from-[#FC8A06] to-orange-500 text-white hover:from-[#e67e05] hover:to-orange-600 shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50",
    secondary: "bg-gradient-to-r from-[#03081F] to-slate-800 text-white hover:from-[#0a1129] hover:to-slate-900 shadow-lg shadow-slate-300/50",
    outline: "border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300",
    danger: "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-200/50",
    success: "bg-gradient-to-r from-[#028643] to-emerald-500 text-white hover:from-[#02753a] hover:to-emerald-600 shadow-lg shadow-emerald-200/50",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export const Badge: React.FC<{ status: OrderStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
const styles = {
  [OrderStatus.EN_ATTENTE_VALIDATION]: "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200",
  [OrderStatus.VALIDEE]: "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200",
  [OrderStatus.EN_COURS]: "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200",
  [OrderStatus.PRETE]: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200",
  [OrderStatus.SERVIE]: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200",
  [OrderStatus.PAYEE]: "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200",
  [OrderStatus.ANNULEE]: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200"
};

const labels = {
  [OrderStatus.EN_ATTENTE_VALIDATION]: "À Valider",
  [OrderStatus.VALIDEE]: "Validée",
  [OrderStatus.EN_COURS]: "En Cuisine",
  [OrderStatus.PRETE]: "Prêt",
  [OrderStatus.SERVIE]: "Servi",
  [OrderStatus.PAYEE]: "Payée",
  [OrderStatus.ANNULEE]: "Annulée"
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs"
};

  return (
    <span className={`${sizeClasses[size]} rounded-full font-bold border ${styles[status]} inline-flex items-center gap-1`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === OrderStatus.EN_COURS ? 'bg-orange-500 animate-pulse' : 
        status === OrderStatus.PRETE ? 'bg-green-500' : 
        'bg-current opacity-50'
      }`}></span>
      {labels[status]}
    </span>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; hover?: boolean }> = ({ children, className = '', hover = false }) => (
  <div className={`bg-white rounded-2xl shadow-md border border-gray-100/50 overflow-hidden ${hover ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300' : ''} ${className}`}>
    {children}
  </div>
);

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-white rounded-3xl w-full ${sizeClasses[size]} overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-black text-[#03081F]">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
        {footer && (
          <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
