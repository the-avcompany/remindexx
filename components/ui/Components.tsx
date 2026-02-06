
import React from 'react';

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-soft border border-slate-100 ${className}`}>
    {children}
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  // Softened weights: font-medium or semibold (600 max)
  const baseStyle = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg active:scale-[0.98]";
  
  const variants = {
    // Primary: Uses primary-strong for the background
    primary: "bg-primary-strong text-white hover:bg-primary shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 border border-transparent",
    
    // Secondary: Slate text, white bg, standard border. Hover uses soft theme tint.
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-primary-soft hover:text-primary-strong hover:border-primary/20 shadow-sm",
    
    // Danger: Subtle red text, white bg. We keep red ONLY for destructive actions as standard UX, but very subtle.
    danger: "bg-white text-red-600 border border-red-100 hover:bg-red-50 hover:border-red-200 shadow-sm",
    
    // Ghost: Transparent, hover theme tint
    ghost: "bg-transparent text-slate-500 hover:text-primary-strong hover:bg-primary-soft"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs", 
    md: "px-5 py-3 text-sm", 
    lg: "px-7 py-4 text-base"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, rightElement, className = '', ...props }) => (
  <div className="w-full group">
    {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}
    <div className="relative">
      <input
        className={`w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft transition-all text-slate-900 placeholder:text-slate-400 font-medium hover:border-slate-300 text-sm ${rightElement ? 'pr-12' : ''} ${className}`}
        {...props}
      />
      {rightElement && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {rightElement}
        </div>
      )}
    </div>
  </div>
);

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ label, className = '', children, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}
    <div className="relative">
      <select
        className={`w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft transition-all text-slate-900 appearance-none font-medium hover:border-slate-300 cursor-pointer text-sm ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </div>
);

// --- Badge ---
// Updated: Removes color prop mapping. Uses theme variants strictly.
// If we need to indicate 'warning' or 'success', we use opacity or icons, not rainbow colors.
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'soft' | 'outline' | 'solid'; className?: string; color?: any }> = ({ children, variant = 'soft', className = '' }) => {
  // Note: 'color' prop is ignored to enforce theme consistency
  
  const styles = {
    // Standard: Light theme background, strong theme text
    soft: "bg-primary-soft text-primary-strong border border-primary/10",
    
    // Outline: Transparent bg, theme border
    outline: "bg-transparent text-slate-600 border border-slate-200",
    
    // Solid: Theme background (rarely used for badges to avoid noise)
    solid: "bg-primary text-white border border-transparent"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

// --- Modal ---
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
