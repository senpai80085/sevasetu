import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { validateSession } from '../utils/auth';

export default function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    const isValid = validateSession();

    useEffect(() => {
        if (!isValid) {
            // Session invalid or wrong role
            // validateSession() handles clearing storage and alerts
        }
    }, [isValid, navigate]);

    if (!isValid) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
