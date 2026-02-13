import React from 'react';

export default function ScreenContainer({ children }) {
    return (
        <div className="flex justify-center min-h-screen bg-background">
            <div className="w-full max-w-mobile bg-background min-h-screen px-4 py-6 pb-24 relative shadow-xl">
                {children}
            </div>
        </div>
    );
}
