import React from 'react';

/**
 * PrimaryButton – full-width, large touch target, bilingual label.
 */
export default function PrimaryButton({
    en,
    hi,
    onClick,
    disabled = false,
    variant = 'primary', // primary | danger | secondary
    type = 'button',
    className = '',
}) {
    const variants = {
        primary: 'bg-primary text-white',
        danger: 'bg-danger text-white',
        secondary: 'bg-secondary text-white',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
        w-full py-4 rounded-xl text-button font-semibold
        transition-opacity
        ${variants[variant] || variants.primary}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:opacity-80'}
        ${className}
      `}
        >
            <span className="block">{en}</span>
            {hi && <span className="block text-sm opacity-80 font-hindi mt-0.5">{hi}</span>}
        </button>
    );
}
