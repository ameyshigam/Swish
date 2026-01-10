import React from 'react';

const Input = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    name,
    error,
    className = ''
}) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`px-4 py-2 rounded-lg border bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm focus:ring-2 focus:outline-none transition-all dark:text-white
          ${error
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-700 dark:focus:border-red-500 dark:focus:ring-red-900/30'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100 dark:border-slate-700 dark:focus:border-blue-500 dark:focus:ring-blue-900/30'
                    }`}
            />
            {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
        </div>
    );
};

export default Input;
