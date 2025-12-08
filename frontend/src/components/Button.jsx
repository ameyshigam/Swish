import React from 'react';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    type = 'button',
    className = '',
    disabled = false
}) => {
    const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/30",
        secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
        outline: "border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600",
        ghost: "text-slate-600 hover:bg-slate-50",
        danger: "bg-red-500 hover:bg-red-600 text-white"
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
