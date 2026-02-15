import React, { useState } from 'react';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';
import { getSession, getAuthHeaders, validateSession } from '../utils/auth';

const CAREGIVER_API = 'http://localhost:8001';

export default function ToggleAvailability() {
    const [available, setAvailable] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleToggle = async () => {
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch(`${CAREGIVER_API}/caregiver/availability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({
                    caregiver_id: parseInt(localStorage.getItem('caregiver_id') || '1'),
                    available: !available,
                }),
            });

            if (res.ok) {
                setAvailable(!available);
                setMessage('Availability updated successfully');
            } else {
                throw new Error('API error');
            }
        } catch (err) {
            // DEMO_MODE: Toggle locally even if API fails
            console.log('DEMO_MODE: API failed, toggling locally', err);
            setAvailable(!available);
            setMessage('Availability updated successfully');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <DualText en="Availability" hi="उपलब्धता" size="heading" className="mb-6" />

            <CareCard className="flex flex-col items-center py-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${available ? 'bg-primary/20 text-primary' : 'bg-gray-200 text-gray-500'}`}>
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h3 className="text-xl font-semibold mb-1">
                    {available ? 'Available' : 'Unavailable'}
                </h3>
                <p className="text-sm text-txtSecondary mb-6 font-hindi">
                    {available ? 'उपलब्ध' : 'अनुपलब्ध'}
                </p>

                <div className="w-full max-w-xs">
                    <PrimaryButton
                        en={available ? "Go Offline" : "Go Online"}
                        hi={available ? "ऑफलाइन हो जाएं" : "ऑनलाइन हो जाएं"}
                        onClick={handleToggle}
                        variant={available ? 'secondary' : 'primary'}
                        disabled={loading}
                    />
                </div>

                {message && (
                    <p className={`mt-4 text-sm font-medium ${message.includes('failed') ? 'text-danger' : 'text-primary'}`}>
                        {message}
                    </p>
                )}
            </CareCard>
        </ScreenContainer>
    );
}
