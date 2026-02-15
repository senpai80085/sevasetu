import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScreenContainer from '../components/ScreenContainer';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';
import CareCard from '../components/CareCard';

/* ── DEMO_MODE: Fallback caregiver if API fails ──────────────────────── */
const DEMO_FALLBACK_CAREGIVER = {
    caregiver_id: 0,
    name: "Demo Caregiver",
    skills: ["elderly_care", "assistance"],
    experience_years: 3,
    rating_average: 4.7,
    trust_score: 88.0,
    match_score: 88.0,
    ai_confidence: 96.0,
    ai_reason: "Best reliability prediction",
};

function getAuthToken() {
    try {
        const session = localStorage.getItem('civilian_session');
        if (session) return JSON.parse(session).access_token;
    } catch { /* ignore */ }
    return localStorage.getItem('access_token') || '';
}

export default function FindCaregiver() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1=Search, 2=Loading, 3=Result, 4=Success
    const [loading, setLoading] = useState(false);
    const [match, setMatch] = useState(null);
    const [service, setService] = useState('elderly');
    const [dateChoice, setDateChoice] = useState('today');  // 'today' | 'tomorrow' | 'custom'
    const [customDate, setCustomDate] = useState('');
    const [hours, setHours] = useState(2);

    // Build start/end ISO strings from user choices
    const getTimeRange = () => {
        let start;
        if (dateChoice === 'tomorrow') {
            start = new Date();
            start.setDate(start.getDate() + 1);
            start.setHours(9, 0, 0, 0);
        } else if (dateChoice === 'custom' && customDate) {
            start = new Date(customDate + 'T09:00:00');
        } else {
            start = new Date(); // today, now
        }
        const end = new Date(start.getTime() + hours * 3600000);
        return { start_time: start.toISOString(), end_time: end.toISOString() };
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setStep(2); // Show AI Animation

        const civilianId = localStorage.getItem('civilian_id') || '1';
        const token = getAuthToken();
        const { start_time, end_time } = getTimeRange();

        const tryMatch = async () => {
            const res = await fetch('http://localhost:8002/civilian/match-caregivers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    civilian_id: parseInt(civilianId),
                    required_skills: [service],
                    start_time,
                    end_time,
                }),
            });
            const data = await res.json();
            if (res.ok && data.caregivers?.length > 0) {
                return data.caregivers[0];
            }
            return null;
        };

        try {
            let result = await tryMatch();
            if (!result) {
                await new Promise(r => setTimeout(r, 500));
                result = await tryMatch();
            }
            setMatch(result || DEMO_FALLBACK_CAREGIVER);
            setStep(3);
        } catch (err) {
            console.error('Match API failed, using fallback', err);
            setMatch(DEMO_FALLBACK_CAREGIVER);
            setStep(3);
        }
    };

    const handleHire = async () => {
        setLoading(true);
        const { start_time, end_time } = getTimeRange();
        try {
            const civilianId = localStorage.getItem('civilian_id') || '1';
            const token = getAuthToken();

            console.log('Attempting to hire with:', { civilianId, service, start_time, end_time });
            const res = await fetch('http://localhost:8002/civilian/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    civilian_id: parseInt(civilianId),
                    required_skills: [service],
                    start_time,
                    end_time,
                }),
            });
            console.log('Hire API response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('current_booking_id', data.booking_id);
                if (match) localStorage.setItem('current_caregiver_name', match.name);
            } else {
                if (match) localStorage.setItem('current_caregiver_name', match.name);
            }
        } catch (err) {
            console.error('Hire API failed:', err);
            if (match) localStorage.setItem('current_caregiver_name', match.name);
        } finally {
            setLoading(false);
            navigate('/session');
        }
    };

    const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const tomStr = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); })();

    return (
        <ScreenContainer>
            {/* Step 1: Search Form */}
            {step === 1 && (
                <div className="p-4">
                    <DualText en="Find a Caregiver" hi="देखभालकर्ता खोजें" size="heading" className="mb-6" />

                    <form onSubmit={handleSearch} className="space-y-4">
                        {/* Service Type */}
                        <CareCard>
                            <label className="block text-sm font-semibold mb-2">
                                🩺 Service Type <span className="font-hindi text-txtSecondary font-normal">/ सेवा प्रकार</span>
                            </label>
                            <select
                                value={service}
                                onChange={(e) => setService(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-surface border border-divider"
                            >
                                <option value="elderly">👴 Elderly Care</option>
                                <option value="child">👶 Child Care</option>
                                <option value="nursing">🏥 Nursing</option>
                            </select>
                        </CareCard>

                        {/* Date Selection */}
                        <CareCard>
                            <label className="block text-sm font-semibold mb-3">
                                📅 When do you need care? <span className="font-hindi text-txtSecondary font-normal">/ कब चाहिए?</span>
                            </label>
                            <div className="flex gap-2 mb-2">
                                <button
                                    type="button"
                                    onClick={() => setDateChoice('today')}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${dateChoice === 'today'
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'bg-background border border-divider text-txtSecondary'
                                        }`}
                                >
                                    Today
                                    <span className="block text-xs font-normal opacity-80">{todayStr}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDateChoice('tomorrow')}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${dateChoice === 'tomorrow'
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'bg-background border border-divider text-txtSecondary'
                                        }`}
                                >
                                    Tomorrow
                                    <span className="block text-xs font-normal opacity-80">{tomStr}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDateChoice('custom')}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${dateChoice === 'custom'
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'bg-background border border-divider text-txtSecondary'
                                        }`}
                                >
                                    Pick Date
                                    <span className="block text-xs font-normal opacity-80">📆</span>
                                </button>
                            </div>
                            {dateChoice === 'custom' && (
                                <input
                                    type="date"
                                    value={customDate}
                                    onChange={(e) => setCustomDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full h-12 px-4 rounded-xl bg-surface border border-divider mt-2"
                                    required
                                />
                            )}
                        </CareCard>

                        {/* Duration */}
                        <CareCard>
                            <label className="block text-sm font-semibold mb-3">
                                ⏱ How many hours? <span className="font-hindi text-txtSecondary font-normal">/ कितने घंटे?</span>
                            </label>
                            <div className="flex items-center justify-between gap-2">
                                {[1, 2, 3, 4, 6, 8].map(h => (
                                    <button
                                        key={h}
                                        type="button"
                                        onClick={() => setHours(h)}
                                        className={`w-12 h-12 rounded-xl text-sm font-bold transition-all ${hours === h
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110'
                                            : 'bg-background border border-divider text-txtSecondary'
                                            }`}
                                    >
                                        {h}h
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-xs text-txtSecondary mt-2">
                                {hours} hour{hours > 1 ? 's' : ''} of care
                                <span className="font-hindi"> • {hours} घंटे</span>
                            </p>
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
                                <p className="text-xs text-txtSecondary mt-1">{match.experience_years} years experience</p>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {(match.skills || []).map((skill) => (
                                <span key={skill} className="text-xs bg-secondary/20 text-primary px-2.5 py-1 rounded-lg font-medium">
                                    {skill.replace(/_/g, ' ')}
                                </span>
                            ))}
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

            {/* Step 4: DEMO_MODE — Success Screen */}
            {step === 4 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <DualText
                        en="Request Sent!"
                        hi="अनुरोध भेजा गया!"
                        size="heading"
                        className="mb-2"
                    />
                    <DualText
                        en={`${match?.name || 'Caregiver'} has been notified`}
                        hi="देखभालकर्ता को सूचित किया गया है"
                        size="small"
                        className="mb-8 text-txtSecondary"
                    />
                    <PrimaryButton
                        en="View Bookings"
                        hi="बुकिंग देखें"
                        onClick={() => navigate('/bookings')}
                    />
                </div>
            )}
        </ScreenContainer>
    );
}
