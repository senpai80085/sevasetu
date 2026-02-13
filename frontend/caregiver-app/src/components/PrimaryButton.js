import React from 'react';
import DualText from './DualText';

export default function PrimaryButton({ en, hi, onClick, variant = 'primary', disabled = false, type = 'button' }) {
    const variants = {
        primary: 'bg-primary text-white hover:bg-opacity-90',
        secondary: 'bg-secondary text-primary hover:bg-opacity-90',
        danger: 'bg-danger/10 text-danger hover:bg-danger/20',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`w-full py-4 px-6 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
        >
            <span className="text-lg font-semibold">{en}</span>
            {hi && <span className="text-sm font-hindi opacity-90 mt-0.5">{hi}</span>}
        </button>
    );
}
