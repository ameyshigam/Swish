import React from 'react';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    type = 'button',
    className = '',
    disabled = false
}) => {
    // Enhanced base styles with better spacing and transitions
    const baseStyles = "relative font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 neo-button active:scale-[0.98]";

    const variants = {
        primary: "neo-button-primary",
        secondary: "neo-button-secondary",
        outline: "border border-input bg-background/50 backdrop-blur-sm hover:bg-accent/10 hover:border-accent hover:text-accent font-medium shadow-none",
        ghost: "bg-transparent shadow-none hover:bg-accent/10 hover:text-accent font-medium",
        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg"
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
