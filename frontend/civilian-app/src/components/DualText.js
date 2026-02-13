import React from 'react';

/**
 * DualText – bilingual English + Hindi text block.
 * Always shows English as primary, Hindi as secondary muted line below.
 */
export default function DualText({ en, hi, className = '', size = 'body' }) {
    const sizeMap = {
        heading: 'text-heading font-semibold',
        body: 'text-body',
        small: 'text-sm',
        button: 'text-button font-medium',
    };

    return (
        <div className={className}>
            <span className={`block ${sizeMap[size] || sizeMap.body} text-txtPrimary`}>
                {en}
            </span>
            <span className="block text-sm text-txtSecondary font-hindi mt-0.5">
                {hi}
            </span>
        </div>
    );
}
