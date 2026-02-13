import React from 'react';

export default function DualText({ en, hi, size = 'body', className = '' }) {
    const styles = {
        heading: 'text-2xl font-bold text-primary mb-1',
        subheading: 'text-lg font-semibold text-txtPrimary',
        body: 'text-base font-normal text-txtPrimary',
        caption: 'text-sm text-txtSecondary',
    };

    const hindiStyles = {
        heading: 'text-lg font-normal text-txtSecondary mt-0.5',
        subheading: 'text-sm font-normal text-txtSecondary',
        body: 'text-sm font-normal text-txtSecondary mt-0.5',
        caption: 'text-xs font-normal text-txtSecondary opacity-80',
    };

    return (
        <div className={`flex flex-col ${className}`}>
            <span className={styles[size]}>{en}</span>
            {hi && <span className={`font-hindi leading-tight ${hindiStyles[size]}`}>{hi}</span>}
        </div>
    );
}
