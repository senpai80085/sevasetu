import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';
import TrustBadge from '../components/TrustBadge';

export default function MatchResults() {
    const navigate = useNavigate();
    const location = useLocation();
    const [caregivers, setCaregivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selecting, setSelecting] = useState(null);

    const { careType, startTime, endTime } = location.state || {};

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await fetch('http://localhost:8002/civilian/match-caregivers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                        civilian_id: parseInt(localStorage.getItem('civilian_id') || '1'),
                        required_skills: [careType || 'elder_care'],
                        start_time: startTime || new Date().toISOString(),
                        end_time: endTime || new Date(Date.now() + 7200000).toISOString(),
                    }),
                });

                if (!res.ok) throw new Error('Failed to find caregivers');
                const data = await res.json();
                setCaregivers(data.caregivers || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [careType, startTime, endTime]);

    const handleSelect = async (caregiver) => {
        setSelecting(caregiver.caregiver_id);
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch('http://localhost:8002/civilian/confirm-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    civilian_id: parseInt(localStorage.getItem('civilian_id') || '1'),
                    caregiver_id: caregiver.caregiver_id,
                    start_time: startTime || new Date().toISOString(),
                    end_time: endTime || new Date(Date.now() + 7200000).toISOString(),
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || 'Booking failed');
            }

            const data = await res.json();
            localStorage.setItem('current_booking_id', data.booking_id);
            localStorage.setItem('current_caregiver_name', caregiver.name);
            navigate('/session');
        } catch (err) {
            setError(err.message);
        } finally {
            setSelecting(null);
        }
    };

    if (loading) {
        return (
            <ScreenContainer>
                <DualText en="Finding caregivers..." hi="देखभालकर्ता खोज रहे हैं..." size="heading" className="mt-12 text-center" />
                <div className="flex justify-center mt-8">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <DualText en="Matched Caregivers" hi="मिलान किए गए देखभालकर्ता" size="heading" className="mb-6" />

            {error && (
                <CareCard className="mb-4 bg-danger/10">
                    <DualText en={error} hi="कनेक्शन नहीं हो पाया, कृपया फिर प्रयास करें" size="small" />
                </CareCard>
            )}

            {caregivers.length === 0 && !error && (
                <CareCard className="text-center py-8">
                    <DualText
                        en="No caregivers available right now"
                        hi="अभी कोई देखभालकर्ता उपलब्ध नहीं है"
                    />
                    <PrimaryButton en="Try Again" hi="फिर प्रयास करें" onClick={() => navigate('/')} className="mt-4" />
                </CareCard>
            )}

            <div className="space-y-4">
                {caregivers.map((cg) => (
                    <CareCard key={cg.caregiver_id}>
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-lg font-semibold text-txtPrimary">{cg.name}</h3>
                                <p className="text-sm text-txtSecondary">
                                    {cg.experience_years} years experience
                                    <span className="font-hindi block">{cg.experience_years} वर्ष का अनुभव</span>
                                </p>
                            </div>
                            <TrustBadge score={cg.trust_score?.toFixed(0)} />
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {(cg.skills || []).map((skill) => (
                                <span key={skill} className="text-xs bg-secondary/20 text-primary px-2.5 py-1 rounded-lg font-medium">
                                    {skill.replace(/_/g, ' ')}
                                </span>
                            ))}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-4 text-sm text-txtSecondary">
                            {'★'.repeat(Math.round(cg.rating_average || 0))}
                            {'☆'.repeat(5 - Math.round(cg.rating_average || 0))}
                            <span className="ml-1">{cg.rating_average?.toFixed(1)}</span>
                        </div>

                        <PrimaryButton
                            en="Select"
                            hi="चुनें"
                            onClick={() => handleSelect(cg)}
                            disabled={selecting === cg.caregiver_id}
                        />
                    </CareCard>
                ))}
            </div>
        </ScreenContainer>
    );
}
