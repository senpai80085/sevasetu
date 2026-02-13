/**
 * Auth utilities for caregiver session management.
 */

const ROLE = 'caregiver';
const STORAGE_KEY = 'caregiver_session';

export function getSession() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

export function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('caregiver_phone');
    localStorage.removeItem('caregiver_id');
}

export function validateSession() {
    const session = getSession();

    if (!session) return false;

    // Strict role check
    if (session.role !== ROLE) {
        console.error(`Role mismatch: expected ${ROLE}, got ${session.role}`);
        clearSession();
        alert('Wrong account type. This app is for caregivers only.\nयह ऐप केवल देखभालकर्ताओं के लिए है।');
        window.location.href = '/login';
        return false;
    }

    return true;
}

export async function logout() {
    const session = getSession();
    if (session?.access_token) {
        try {
            await fetch('http://localhost:8006/auth/logout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });
        } catch (e) { console.error(e); }
    }
    clearSession();
    window.location.href = '/login';
}

export function getAuthHeaders() {
    const session = getSession();
    return session ? { 'Authorization': `Bearer ${session.access_token}` } : {};
}
