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
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!careType || !date || !time) return;

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('access_token');
            const startTime = new Date(`${date}T${time}`).toISOString();
            const endTime = new Date(new Date(`${date}T${time}`).getTime() + 2 * 60 * 60 * 1000).toISOString();

            // Request care
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

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || 'Request failed');
            }

            const data = await res.json();
            localStorage.setItem('current_booking_id', data.booking_id);
            navigate('/match', { state: { careType, startTime, endTime } });
        } catch (err) {
            setError(err.message || 'We couldn\'t connect. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <DualText en="SevaSetu" hi="सेवासेतु" size="heading" className="mb-1" />
            <DualText
                en="Book trusted care, safely"
                hi="विश्वसनीय देखभाल, सुरक्षित रूप से"
                size="small"
                className="mb-6"
            />

            {/* Reassurance banner */}
            <CareCard className="mb-6 bg-accent/40">
                <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 1l6 3v5c0 4.418-2.686 8.166-6 9-3.314-.834-6-4.582-6-9V4l6-3z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <DualText
                        en="Verified caregivers only"
                        hi="सत्यापित देखभालकर्ता ही दिखाए जाएंगे"
                        size="small"
                    />
                </div>
            </CareCard>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Care type */}
                <div>
                    <label className="block text-body font-medium text-txtPrimary mb-1.5">
                        Type of Care
                        <span className="block text-sm text-txtSecondary font-hindi">देखभाल का प्रकार</span>
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

                {/* Date */}
                <div>
                    <label className="block text-body font-medium text-txtPrimary mb-1.5">
                        Date
                        <span className="block text-sm text-txtSecondary font-hindi">तारीख़</span>
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-surface border border-divider text-body focus:outline-none focus:ring-2 focus:ring-primary/30"
                        required
                    />
                </div>

                {/* Time */}
                <div>
                    <label className="block text-body font-medium text-txtPrimary mb-1.5">
                        Time
                        <span className="block text-sm text-txtSecondary font-hindi">समय</span>
                    </label>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-surface border border-divider text-body focus:outline-none focus:ring-2 focus:ring-primary/30"
                        required
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-body font-medium text-txtPrimary mb-1.5">
                        Notes (optional)
                        <span className="block text-sm text-txtSecondary font-hindi">टिप्पणी (वैकल्पिक)</span>
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-divider text-body focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        placeholder="Any special instructions... / कोई विशेष निर्देश..."
                    />
                </div>

                {/* Error */}
                {error && (
                    <CareCard className="bg-danger/10">
                        <DualText
                            en={error}
                            hi="कनेक्शन नहीं हो पाया, कृपया फिर प्रयास करें"
                            size="small"
                        />
                    </CareCard>
                )}

                <PrimaryButton
                    en="Find Caregiver"
                    hi="केयरगिवर खोजें"
                    type="submit"
                    disabled={loading || !careType || !date || !time}
                />
            </form>
        </ScreenContainer>
    );
}
