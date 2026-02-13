import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/', en: 'Home', hi: 'होम', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
    { path: '/bookings', en: 'Bookings', hi: 'बुकिंग', icon: 'M8 7V3m8 4V3m-9 4h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { path: '/safety', en: 'Safety', hi: 'सुरक्षा', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { path: '/history', en: 'History', hi: 'इतिहास', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/profile', en: 'Profile', hi: 'प्रोफ़ाइल', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-divider z-50">
            <div className="max-w-app mx-auto flex justify-around py-2">
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
