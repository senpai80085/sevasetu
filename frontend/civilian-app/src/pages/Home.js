import React, { useState } from 'react';
import ScreenContainer from '../components/ScreenContainer';
import CareCard from '../components/CareCard';
import DualText from '../components/DualText';
import PrimaryButton from '../components/PrimaryButton';
import { useNavigate } from 'react-router-dom';

const CARE_TYPES = [
    { value: 'elder_care', en: 'Elder Care', hi: 'बुज़ुर्गों की देखभाल' },
    { value: 'medical', en: 'Medical Support', hi: 'चिकित्सा सहायता' },
    { value: 'daily_living', en: 'Daily Living Aid', hi: 'दैनिक जीवन सहायता' },
    { value: 'companion', en: 'Companion Care', hi: 'साथी देखभाल' },
];

export default function Home() {
    const navigate = useNavigate();
    const [careType, setCareType] = useState('');
    const [dateChoice, setDateChoice] = useState('today');  // 'today' | 'tomorrow' | 'custom'
    const [customDate, setCustomDate] = useState('');
    const [hours, setHours] = useState(2);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!careType) return;
        if (dateChoice === 'custom' && !customDate) return;

        setLoading(true);
        setError('');

        // Build start/end ISO strings
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
        const startTime = start.toISOString();
        const endTime = new Date(start.getTime() + hours * 3600000).toISOString();

        try {
            let token = localStorage.getItem('access_token');
            try {
                const session = localStorage.getItem('civilian_session');
                if (session) token = JSON.parse(session).access_token;
            } catch { /* use fallback */ }

            const res = await fetch('http://localhost:8002/civilian/request-care', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    civilian_id: parseInt(localStorage.getItem('civilian_id') || '1'),
                    required_skills: [careType],
                    start_time: startTime,
                    end_time: endTime,
                    notes,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('current_booking_id', data.booking_id);
            }
            navigate('/match', { state: { careType, startTime, endTime } });
        } catch (err) {
            console.error('request-care failed', err);
            navigate('/match', { state: { careType, startTime, endTime } });
        } finally {
            setLoading(false);
        }
    };

    const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const tomStr = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); })();

    return (
        <ScreenContainer>
            <DualText en="SevaSetu" hi="सेवासेतु" size="heading" className="mb-1" />
            <DualText
                en="Book trusted care, safely"
                hi="विश्वसनीय देखभाल, सुरक्षित रूप से"
                size="small"
                className="mb-6"
            />

            <CareCard className="mb-6 bg-accent/40">
                <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 1l6 3v5c0 4.418-2.686 8.166-6 9-3.314-.834-6-4.582-6-9V4l6-3z" clipRule="evenodd" />
                    </svg>
                    <DualText en="Verified caregivers only" hi="सत्यापित देखभालकर्ता ही दिखाए जाएंगे" size="small" />
                </div>
            </CareCard>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Care type */}
                <div>
                    <label className="block text-sm font-semibold text-txtPrimary mb-1.5">
                        Type of Care <span className="font-hindi text-txtSecondary font-normal">/ देखभाल का प्रकार</span>
                    </label>
                    <select
                        value={careType}
                        onChange={(e) => setCareType(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-surface border border-divider text-body focus:outline-none focus:ring-2 focus:ring-primary/30"
                        required
                    >
                        <option value="">Select / चुनें</option>
                        {CARE_TYPES.map((ct) => (
                            <option key={ct.value} value={ct.value}>
                                {ct.en} — {ct.hi}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Selection */}
                <div>
                    <label className="block text-sm font-semibold text-txtPrimary mb-3">
                        When do you need care? <span className="font-hindi text-txtSecondary font-normal">/ कब चाहिए?</span>
                    </label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setDateChoice('today')}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${dateChoice === 'today'
                                ? 'bg-primary text-white shadow-lg'
                                : 'bg-background border border-divider text-txtSecondary'
                                }`}
                        >
                            Today
                            <span className="block text-[10px] font-normal opacity-80">{todayStr}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setDateChoice('tomorrow')}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${dateChoice === 'tomorrow'
                                ? 'bg-primary text-white shadow-lg'
                                : 'bg-background border border-divider text-txtSecondary'
                                }`}
                        >
                            Tomorrow
                            <span className="block text-[10px] font-normal opacity-80">{tomStr}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setDateChoice('custom')}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${dateChoice === 'custom'
                                ? 'bg-primary text-white shadow-lg'
                                : 'bg-background border border-divider text-txtSecondary'
                                }`}
                        >
                            Custom
                            <span className="block text-[10px] font-normal opacity-80">Pick Date 📆</span>
                        </button>
                    </div>
                    {dateChoice === 'custom' && (
                        <input
                            type="date"
                            value={customDate}
                            onChange={(e) => setCustomDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full h-12 px-4 rounded-xl bg-surface border border-divider mt-2 text-sm"
                            required
                        />
                    )}
                </div>

                {/* Duration */}
                <div>
                    <label className="block text-sm font-semibold text-txtPrimary mb-3">
                        Duration <span className="font-hindi text-txtSecondary font-normal">/ अवधि (घंटे)</span>
                    </label>
                    <div className="flex items-center justify-between gap-1.5">
                        {[1, 2, 3, 4, 6, 8].map(h => (
                            <button
                                key={h}
                                type="button"
                                onClick={() => setHours(h)}
                                className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all ${hours === h
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-background border border-divider text-txtSecondary'
                                    }`}
                            >
                                {h}h
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-semibold text-txtPrimary mb-1.5">
                        Notes (optional) <span className="font-hindi text-txtSecondary font-normal">/ टिप्पणी</span>
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 rounded-xl bg-surface border border-divider text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        placeholder="Any special instructions... / कोई निर्देश..."
                    />
                </div>

                {error && (
                    <CareCard className="bg-danger/10 py-2">
                        <DualText en={error} hi="एरर" size="small" />
                    </CareCard>
                )}

                <PrimaryButton
                    en={loading ? "Finding..." : "Find Caregiver"}
                    hi={loading ? "खोज रहे हैं..." : "केयरगिवर खोजें"}
                    type="submit"
                    disabled={loading || !careType}
                    className="mt-2"
                />
            </form>
        </ScreenContainer>
    );
}
