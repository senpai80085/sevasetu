import React from 'react';

/**
 * TrustBadge – green shield icon + "Trusted / विश्वसनीय" label.
 */
export default function TrustBadge({ score, className = '' }) {
    return (
        <div className={`inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-xl ${className}`}>
            {/* Shield icon */}
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path
                    fillRule="evenodd"
                    d="M10 1l6 3v5c0 4.418-2.686 8.166-6 9-3.314-.834-6-4.582-6-9V4l6-3z"
                    clipRule="evenodd"
                />
            </svg>
            <div>
                <span className="text-sm font-semibold text-primary">
                    Trusted {score ? `· ${score}` : ''}
                </span>
                <span className="block text-xs text-txtSecondary font-hindi">
                    विश्वसनीय
                </span>
            </div>
        </div>
    );
}
