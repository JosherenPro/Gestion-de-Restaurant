
import React from 'react';
import { OrderStatus } from '../types';

export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', disabled, fullWidth }) => {
  const baseStyles = "px-4 py-2 rounded-full font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95";
  const variants = {
    primary: "bg-[#FC8A06] text-white hover:bg-[#e67e05]",
    secondary: "bg-[#03081F] text-white hover:bg-[#0a1129]",
    outline: "border-2 border-gray-200 text-gray-700 hover:bg-gray-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-[#028643] text-white hover:bg-[#02753a]"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export const Badge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const styles = {
    [OrderStatus.EN_ATTENTE_VALIDATION]: "bg-yellow-100 text-yellow-800 border-yellow-200",
    [OrderStatus.A_PREPARER]: "bg-blue-100 text-blue-800 border-blue-200",
    [OrderStatus.EN_PREPARATION]: "bg-orange-100 text-orange-800 border-orange-200",
    [OrderStatus.PRET_A_SERVIR]: "bg-green-100 text-green-800 border-green-200",
    [OrderStatus.LIVRE]: "bg-gray-100 text-gray-800 border-gray-200"
  };

  const labels = {
    [OrderStatus.EN_ATTENTE_VALIDATION]: "À Valider",
    [OrderStatus.A_PREPARER]: "À Préparer",
    [OrderStatus.EN_PREPARATION]: "En Cuisine",
    [OrderStatus.PRET_A_SERVIR]: "Prêt",
    [OrderStatus.LIVRE]: "Servi"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#03081F]">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
        {footer && <div className="p-6 border-t bg-gray-50">{footer}</div>}
      </div>
    </div>
  );
};
