import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';

export default function ActiveSession() {
    const navigate = useNavigate();
    const [seconds, setSeconds] = useState(0);
    const caregiverName = localStorage.getItem('current_caregiver_name') || 'Caregiver';
    const bookingId = localStorage.getItem('current_booking_id');

    useEffect(() => {
        const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    return (
        <ScreenContainer>
            <DualText en="Active Care Session" hi="सक्रिय देखभाल सत्र" size="heading" className="mb-6" />

            {/* Status card */}
            <CareCard className="mb-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>

                    <DualText en="Care in Progress" hi="देखभाल जारी है" size="heading" className="mb-2" />

                    <p className="text-txtSecondary mb-1">
                        Caregiver: <span className="font-semibold text-txtPrimary">{caregiverName}</span>
                    </p>
                    <p className="text-sm text-txtSecondary font-hindi mb-4">
                        देखभालकर्ता: {caregiverName}
                    </p>

                    {/* Timer */}
                    <div className="bg-background rounded-xl py-4 px-6 mb-4">
                        <p className="text-3xl font-bold text-primary font-mono tracking-wider">
                            {formatTime(seconds)}
                        </p>
                        <DualText en="Session duration" hi="सत्र की अवधि" size="small" className="mt-1" />
                    </div>
                </div>
            </CareCard>

            {/* Safety status */}
            <CareCard className="mb-4 bg-primary/5">
                <div className="flex items-center gap-3">
                    <svg className="w-7 h-7 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 1l6 3v5c0 4.418-2.686 8.166-6 9-3.314-.834-6-4.582-6-9V4l6-3z" clipRule="evenodd" />
                    </svg>
                    <DualText en="Safety monitoring active" hi="सुरक्षा निगरानी सक्रिय" size="small" />
                </div>
            </CareCard>

            <PrimaryButton
                en="View Safety Options"
                hi="सुरक्षा विकल्प देखें"
                variant="secondary"
                onClick={() => navigate('/safety')}
                className="mb-4"
            />

            {/* Emergency button — fixed at bottom */}
            <div className="fixed bottom-24 left-0 right-0 px-4">
                <div className="max-w-app mx-auto">
                    <PrimaryButton
                        en="⚠ Emergency"
                        hi="आपातकालीन स्थिति"
                        variant="danger"
                        onClick={() => {
                            alert('Emergency services will be contacted. Guardian has been notified.');
                        }}
                    />
                </div>
            </div>
        </ScreenContainer>
    );
}
