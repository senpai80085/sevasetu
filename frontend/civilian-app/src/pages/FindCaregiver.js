import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScreenContainer from '../components/ScreenContainer';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';
import CareCard from '../components/CareCard';

export default function FindCaregiver() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1=Search, 2=Loading, 3=Result
    const [loading, setLoading] = useState(false);
    const [match, setMatch] = useState(null);
    const [service, setService] = useState('elderly');

    const handleSearch = async (e) => {
        e.preventDefault();
        setStep(2); // Show AI Animation

        try {
            const civilianId = localStorage.getItem('civilian_id');
            const res = await fetch('http://localhost:8002/civilian/match-caregivers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('civilian_session') ? `Bearer ${JSON.parse(localStorage.getItem('civilian_session')).access_token}` : ''
                },
                body: JSON.stringify({
                    civilian_id: parseInt(civilianId),
                    required_skills: [service],
                    start_time: new Date().toISOString(),
                    end_time: new Date(Date.now() + 3600000).toISOString(), // 1 hr default
                })
            });
            const data = await res.json();
            if (res.ok && data.caregivers?.length > 0) {
                setMatch(data.caregivers[0]);
                setStep(3);
            } else {
                alert('No caregivers found. Try again.');
                setStep(1);
            }
        } catch (err) {
            console.error(err);
            setStep(1);
        }
    };

    const handleHire = async () => {
        setLoading(true);
        try {
            const civilianId = localStorage.getItem('civilian_id');
            const res = await fetch('http://localhost:8002/civilian/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('civilian_session') ? `Bearer ${JSON.parse(localStorage.getItem('civilian_session')).access_token}` : ''
                },
                body: JSON.stringify({
                    civilian_id: parseInt(civilianId),
                    required_skills: [service],
                    start_time: new Date().toISOString(),
                    end_time: new Date(Date.now() + 3600000).toISOString(),
                })
            });
            if (res.ok) {
                alert('Request Sent to Caregiver!');
                navigate('/bookings');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to hire');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            {/* Step 1: Search Form */}
            {step === 1 && (
                <div className="p-4">
                    <DualText en="Find a Caregiver" hi="देखभालकर्ता खोजें" size="heading" className="mb-6" />

                    <form onSubmit={handleSearch} className="space-y-6">
                        <CareCard>
                            <label className="block text-body font-medium mb-2">Service Type</label>
                            <select
                                value={service}
                                onChange={(e) => setService(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-surface border border-divider"
                            >
                                <option value="elderly">Elderly Care</option>
                                <option value="child">Child Care</option>
                                <option value="nursing">Nursing</option>
                            </select>
                        </CareCard>

                        <PrimaryButton en="Find Best Match" hi="सबसे अच्छा मिलान खोजें" type="submit" />
                    </form>
                </div>
            )}

            {/* Step 2: AI Loading Animation */}
            {step === 2 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                    <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8"></div>
                    <DualText
                        en="AI is finding the safest caregiver..."
                        hi="एआई सबसे सुरक्षित देखभालकर्ता खोज रहा है..."
                        size="subheading"
                        className="animate-pulse"
                    />
                    <p className="mt-4 text-txtSecondary">Analyzing 50+ verifications...</p>
                </div>
            )}

            {/* Step 3: Match Result */}
            {step === 3 && match && (
                <div className="p-4">
                    <DualText en="AI Recommended Match" hi="एआई अनुशंसित मिलान" size="heading" className="mb-6 text-primary" />

                    <CareCard className="mb-6 border-2 border-primary/20">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-xl font-bold text-primary">
                                {match.name[0]}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">{match.name}</h3>
                                <div className="flex items-center gap-1 text-primary text-sm font-medium mt-1">
                                    <span className="bg-primary/10 px-2 py-0.5 rounded">Trust Score: {match.trust_score}</span>
                                    <span>★ {match.rating_average}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-divider">
                            <h4 className="text-sm font-bold text-txtSecondary mb-2">AI Insight</h4>
                            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                <p className="text-sm text-green-800 font-medium">✨ {match.ai_confidence}% Confidence</p>
                                <p className="text-sm text-txtSecondary mt-1">{match.ai_reason}</p>
                            </div>
                        </div>
                    </CareCard>

                    <PrimaryButton
                        en={loading ? "Processing..." : "Hire Now"}
                        hi={loading ? "प्रक्रिया जारी है..." : "अभी हायर करें"}
                        onClick={handleHire}
                        disabled={loading}
                    />

                    <button
                        onClick={() => setStep(1)}
                        className="w-full py-4 mt-2 text-txtSecondary font-medium text-sm"
                    >
                        Try Search Again
                    </button>
                </div>
            )}
        </ScreenContainer>
    );
}
