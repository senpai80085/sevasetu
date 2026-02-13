import React from 'react';

export default function CareCard({ children, className = '', onClick }) {
    return (
        <div
            onClick={onClick}
            className={`bg-surface rounded-xl shadow-sm p-4 border border-gray-50 ${onClick ? 'active:scale-95 transition-transform cursor-pointer' : ''} ${className}`}
        >
            {children}
        </div>
    );
}
