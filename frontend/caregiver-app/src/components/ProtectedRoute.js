import React from 'react';
import { Navigate } from 'react-router-dom';
import { validateSession } from '../utils/auth';

/**
 * DEMO_MODE: ProtectedRoute with auto-login bypass for caregiver app.
 * If no session exists, automatically creates a demo caregiver session.
 */
export default function ProtectedRoute({ children }) {
    let isValid = validateSession();

    // DEMO_MODE: Auto-create demo session if none exists
    if (!isValid) {
        console.log('DEMO_MODE: No caregiver session — creating demo session');
        const demoSession = {
            access_token: 'demo_token_sevasetu_caregiver',
            refresh_token: 'demo_refresh_sevasetu_cg',
            role: 'caregiver',
            identity_id: 1,
            session_id: 'demo_session_cg_001',
        };
        localStorage.setItem('caregiver_session', JSON.stringify(demoSession));
        localStorage.setItem('caregiver_phone', '+919999999999');
        localStorage.setItem('caregiver_id', '1');

        // Re-validate after setting demo session
        isValid = validateSession();
    }

    if (!isValid) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
