/**
 * Auth utilities for frontend session management.
 * 
 * Provides helpers for:
 * - Getting/setting role-specific tokens
 * - Role validation
 * - Auto-logout on session expiry
 */

const STORAGE_KEYS = {
    civilian: 'civilian_session',
    caregiver: 'caregiver_session',
    guardian: 'guardian_session',
};

/**
 * Get session data for a specific role.
 * 
 * @param {string} role - Role to get session for (civilian/caregiver/guardian)
 * @returns {object|null} Session object or null
 */
export function getSession(role) {
    const key = STORAGE_KEYS[role];
    if (!key) return null;

    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

/**
 * Set session data for a specific role.
 * 
 * @param {string} role - Role to set session for
 * @param {object} sessionData - Session data object
 */
export function setSession(role, sessionData) {
    const key = STORAGE_KEYS[role];
    if (!key) return;

    localStorage.setItem(key, JSON.stringify(sessionData));
}

/**
 * Clear session for a specific role.
 * 
 * @param {string} role - Role to clear
 */
export function clearSession(role) {
    const key = STORAGE_KEYS[role];
    if (!key) return;

    localStorage.removeItem(key);
    localStorage.removeItem('user_phone');
    localStorage.removeItem('user_role');
    localStorage.removeItem(`${role}_id`);
}

/**
 * Validate that the current app matches the session role.
 * Force logout if mismatch detected.
 * 
 * @param {string} expectedRole - Expected role for this app
 * @returns {boolean} True if valid, false if forced logout
 */
export function validateAppRole(expectedRole) {
    const session = getSession(expectedRole);
    if (!session) return false;

    // Check for cross-role token usage
    if (session.role !== expectedRole) {
        console.error(`Role mismatch: expected ${expectedRole}, got ${session.role}`);
        clearSession(expectedRole);

        alert(
            `Wrong account type detected. Please use the ${expectedRole} app.\n` +
            `गलत खाता प्रकार। कृपया ${expectedRole} ऐप का उपयोग करें।`
        );

        window.location.href = '/login';
        return false;
    }

    return true;
}

/**
 * Get authorization header for API requests.
 * 
 * @param {string} role - Role to get token for
 * @returns {object} Headers object
 */
export function getAuthHeaders(role) {
    const session = getSession(role);
    if (!session || !session.access_token) {
        return {};
    }

    return {
        'Authorization': `Bearer ${session.access_token}`,
    };
}

/**
 * Handle 401 responses (token expired or revoked).
 * Shows bilingual message and redirects to login.
 * 
 * @param {string} role - Role to logout
 */
export function handleSessionExpired(role) {
    clearSession(role);

    alert(
        'Your session expired. Please sign in again.\n' +
        'सत्र समाप्त हो गया है, कृपया पुनः लॉगिन करें'
    );

    window.location.href = '/login';
}

/**
 * Logout user from auth-service and clear session.
 * 
 * @param {string} role - Role to logout
 */
export async function logout(role) {
    const session = getSession(role);

    if (session && session.access_token) {
        try {
            await fetch('http://localhost:8006/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });
        } catch (err) {
            console.error('Logout API call failed:', err);
        }
    }

    clearSession(role);
    window.location.href = '/login';
}
