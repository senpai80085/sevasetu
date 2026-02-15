import React from 'react';
import { Navigate } from 'react-router-dom';
import { validateAppRole } from '../utils/auth';

/**
 * DEMO_MODE: ProtectedRoute with auto-login bypass.
 * If no session exists, automatically creates a demo session
 * so the app always works on first load during demo.
 */
export default function ProtectedRoute({ children }) {
    let isValid = validateAppRole('civilian');

    // DEMO_MODE: Auto-create demo session if none exists
    if (!isValid) {
        console.log('DEMO_MODE: No session found — creating demo session');
        const demoSession = {
            access_token: 'demo_token_sevasetu_civilian',
            refresh_token: 'demo_refresh_sevasetu',
            role: 'civilian',
            identity_id: 1,
            session_id: 'demo_session_001',
        };
        localStorage.setItem('civilian_session', JSON.stringify(demoSession));
        localStorage.setItem('user_phone', '+919999999999');
        localStorage.setItem('user_role', 'civilian');
        localStorage.setItem('civilian_id', '1');
        localStorage.setItem('access_token', demoSession.access_token);

        // Re-validate after setting demo session
        isValid = validateAppRole('civilian');
    }

    if (!isValid) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
