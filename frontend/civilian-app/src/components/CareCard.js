import React from 'react';

/**
 * CareCard – rounded card container with soft shadow.
 * Used for caregiver cards, status cards, info panels.
 */
export default function CareCard({ children, className = '', onClick }) {
    return (
        <div
            onClick={onClick}
            className={`
        bg-surface rounded-xl p-5
        shadow-[0_2px_12px_rgba(0,0,0,0.06)]
        ${onClick ? 'cursor-pointer active:shadow-none transition-shadow' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
}
