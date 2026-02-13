import React from 'react';

/**
 * ScreenContainer – mobile-first centered layout wrapper.
 * Max width 480px, consistent padding, background color.
 */
export default function ScreenContainer({ children, className = '' }) {
    return (
        <div className={`w-full max-w-app mx-auto px-4 pb-28 pt-6 min-h-screen bg-background ${className}`}>
            {children}
        </div>
    );
}
