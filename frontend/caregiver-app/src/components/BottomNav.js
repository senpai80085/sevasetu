import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/', en: 'Dashboard', hi: 'डैशबोर्ड', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
    { path: '/jobs', en: 'Jobs', hi: 'नौकरियां', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2' },
    { path: '/availability', en: 'Status', hi: 'स्थिति', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { path: '/profile', en: 'Profile', hi: 'प्रोफ़ाइल', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-divider z-50">
            <div className="max-w-[480px] mx-auto flex justify-around py-2">
                {navItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center gap-0.5 px-2 py-1 min-w-[60px] ${active ? 'text-primary' : 'text-txtSecondary'
                                }`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                            </svg>
                            <span className="text-xs font-medium">{item.en}</span>
                            <span className="text-[10px] font-hindi opacity-70">{item.hi}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
