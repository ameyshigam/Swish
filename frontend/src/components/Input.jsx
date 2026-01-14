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
            {label && <label className="text-sm font-medium text-foreground">{label}</label>}
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:outline-none transition-all text-foreground placeholder:text-muted-foreground
          ${error
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                        : 'border-input focus:border-ring focus:ring-ring/30'
                    }`}
            />
            {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
    );
};

export default Input;
