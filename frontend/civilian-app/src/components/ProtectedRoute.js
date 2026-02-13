import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { validateAppRole } from '../utils/auth';

export default function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    // Check if session exists and role is 'civilian'
    const isValid = validateAppRole('civilian');

    useEffect(() => {
        if (!isValid) {
            // validateAppRole handles alerts and cleanup
        }
    }, [isValid, navigate]);

    if (!isValid) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
